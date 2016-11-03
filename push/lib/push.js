const chokidar = require('chokidar')
const socketIO = require('socket.io-client')
const fs = require('fs')

const TAG = `[push]`

module.exports = function ({
	ignoreInitial,
	path: paths,
	ignored,
	socketHost,
	socketPort,
	socketPath,
	room
	}) {
	let socket = socketIO(`http://${socketHost}:${socketPort}/push?room=${room}`, {path: socketPath})

	socket.on('connect', () => {
		console.info(`${TAG} connect to ${socket.io.uri}`)
	})

	let watcher = chokidar.watch(paths, {
		ignored,
		ignoreInitial
	})

	let change = p => {
		p = p.replace(/\\/g, '/')
		console.info(`${TAG} ${p} add`)

		fs.readFile(p, (err, buf) => {
			if (err) return console.error(`${TAG} ${err}`)

			socket.emit('file', {path: p, text: buf})
		})
	}

	watcher.on('add', change)
	watcher.on('change', change)
}