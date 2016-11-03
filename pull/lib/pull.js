const path = require('path')
const socketIO = require('socket.io-client')
const fs = require('fs-extra')

const TAG = '[pull]'

module.exports = {
	start({
		socketHost,
		socketPort,
		socketPath,
		workplacePath,
		room
		}, callback) {
		workplacePath = path.normalize(workplacePath)
		console.info(`${TAG} initialize, workplacePath:${workplacePath} room:${room}`)

		let socket = socketIO(`http://${socketHost}:${socketPort}/pull?room=${room}`, {path: socketPath})

		socket.on('connect', () => {
			console.info(`${TAG} connect to ${socket.io.uri}`)
		})

		socket.on('onFile', ({path:filePath, text}) => {
			console.info(`${TAG} change ${filePath}`)

			let absFilePath = path.normalize(path.join(workplacePath, filePath))
			if (absFilePath.indexOf(workplacePath) != 0) {
				return console.error(`${TAG} save ${filePath} failed: it is not sub path of ${workplacePath}`)
			}

			fs.outputFile(absFilePath, text, err => {
				if (err) return console.error(`${TAG} save ${filePath} failed: ${err}`)
				console.info(`${TAG} sync ${filePath} success`)
			})
		})

		socket.on('connect', callback)
	}
}