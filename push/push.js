const chokidar = require('chokidar')
const socketIO = require('socket.io-client')
const fs = require('fs')

const TAG = `[push]`

module.exports = function ({
	ignoreInitial,
	path: paths,
	ignored,
	host,
	port,
	room
	}) {
	let socket = socketIO(`http://${host}:${port}/push?room=${room}`)

	let watcher = chokidar.watch(paths, {
		ignored,
		ignoreInitial
	})

	let change = p => {
		p = p.replace(/\\/g, '/')
		console.info(`${TAG} ${p} add`)

		let text = fs.readFileSync(p, {encoding: 'utf-8'})
		socket.emit('file', {path: p, text})
	}

	watcher.on('add', change)
	watcher.on('change', change)
}