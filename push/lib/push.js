const chokidar = require('chokidar')
const socketIO = require('socket.io-client')
const fs = require('fs')
const log = require('log4js').getLogger('push')
const pkg = require('../package')
const versionCheck = require('./share/versionCheck')
const path = require('path')
const Protocol = require('./protocol')
const Task = require('./task')


const waitPushPreparing = function(serverInfo, pushTask, protocol) {
    log.info('wait pull clients connect')
    let unbind = protocol.info(({pullCount}) => {
        if (pullCount > 0) {
            pushTask.resolve()
            unbind()
        }
    })
}

module.exports = function ({
	ignoreInitial,
    paths,
	ignored,
	socketHost,
	socketPort,
	socketPath,
	room,
    watch,
    workplacePath
	}) {
	let socket = socketIO(`http://${socketHost}:${socketPort}/push?room=${room}`, {path: socketPath})
    let protocol = new Protocol(socket)
    let fileCount = 0
    let pushCount = 0
    let ready = false
    log.info(`workplacePath: ${workplacePath}`)


    protocol.connect(() => {
        log.info(`connect: ${socket.io.uri}`)
    })

    protocol.disconnect(() => {
        log.info(`disconnect`)
    })

    protocol.log(({level, message}) => {
        log[level](message)
    })

	protocol.init((serverInfo) => {
        let {version, pullCount} = serverInfo
        let ret = versionCheck.compare(pkg.version, version)
        if (ret == 0) {
            log.info(`check version success, server: ${version}, client: ${pkg.version}`)
        } else {
            if (ret < 0) {
                log.error(`server version not match, server: ${version}, client: ${pkg.version}, you should upgrate the client`)
            } else {
                log.error(`server version not match, server: ${version}, client: ${pkg.version}, you should upgrate the server`)
            }
            socket.close()
            process.exit(-1)
        }

        let pushTask = new Task

        waitPushPreparing(serverInfo, pushTask, protocol)

        pushTask.promise.then(() => {
            log.info('start push event')

        	let watcher = chokidar.watch(paths, {
        		ignored,
        		ignoreInitial,
                cwd: workplacePath
        	})

        	const change = p => {
        		p = p.replace(/\\/g, '/')
        		log.info(`push ${p}`)
                fileCount += 1

        		fs.readFile(path.join(workplacePath, p), (err, buf) => {
        			if (err) {
                        pushCount += 1 // error file bug should add up
                        log.error(err.message)
                        maybeEnd()
                        return
                    }

                    protocol.emitFile(p, buf, () => {
                        pushCount += 1
                        maybeEnd()
                    })
        		})
        	}

            const maybeEnd = () => {
                if (!watch && ready && pushCount == fileCount) {
                    protocol.emitEnd()
                    watcher.close()
                    socket.close()
                    log.info('already push all files, exit')
                }
            }

        	watcher.on('add', change)
        	watcher.on('change', change)
            watcher.on('ready', () => {
                ready = true
                maybeEnd()
            })
        })
	})
}
