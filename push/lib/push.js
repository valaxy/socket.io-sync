const chokidar = require('chokidar')
const socketIO = require('socket.io-client')
const fs = require('fs')
const log = require('log4js').getLogger('push')
const pkg = require('../package')
const versionCheck = require('./versionCheck')
const path = require('path')

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
    let fileCount = 0
    let pushCount = 0
    let ready = false
    log.info(`workplacePath: ${workplacePath}`)

    socket.on('version', ({version}) => {
        if (versionCheck.isCompatible(pkg.version, version)) {
            log.info(`check version success, server: ${version}, client: ${pkg.version}`)
            return
        }

        if (versionCheck.isSmaller(pkg.version, version)) {
            log.error(`server version not match, server: ${version}, client: ${pkg.version}, you should upgrate the client`)
        } else {
            log.error(`server version not match, server: ${version}, client: ${pkg.version}, you should upgrate the server`)
        }
        socket.close()
        process.exit(-1)
    })

	socket.on('connect', () => {
		log.info(`connect to ${socket.io.uri}`)
	})

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

			socket.emit('file', {path: p, text: buf}, () => {
                pushCount += 1
                maybeEnd()
            })
		})
	}

    const maybeEnd = () => {
        if (!watch && ready && pushCount == fileCount) {
            socket.emit('end')
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
}
