const chokidar = require('chokidar')
const socketIO = require('socket.io-client')
const fs = require('fs')
const log = require('log4js').getLogger('push')
const pkg = require('../package')

module.exports = function ({
	ignoreInitial,
    paths,
	ignored,
	socketHost,
	socketPort,
	socketPath,
	room,
    watch
	}) {
	let socket = socketIO(`http://${socketHost}:${socketPort}/push?room=${room}`, {path: socketPath})
    let fileCount = 0
    let pushCount = 0
    let ready = false

    socket.on('version', ({version}) => {
        if (version != pkg.version) {
            log.error(`server version not match, server: ${version}, client: ${pkg.version}, you should upgrate the client or server`)
            socket.close()
            process.exit(-1)
        } else {
            log.info('check version success')
        }
    })

	socket.on('connect', () => {
		log.info(`connect to ${socket.io.uri}`)
	})

	let watcher = chokidar.watch(paths, {
		ignored,
		ignoreInitial
	})

	const change = p => {
		p = p.replace(/\\/g, '/')
		log.info(`push ${p}`)
        fileCount += 1

		fs.readFile(p, (err, buf) => {
			if (err) return log.error(`${err}`)
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
