const path = require('path')
const socketIO = require('socket.io-client')
const fs = require('fs-extra')

const TAG = '[pull]'

module.exports = {
	start({host, port, workplacePath, room}, callback) {
		workplacePath = path.normalize(workplacePath)
		console.info(`${TAG} initialize, workplacePath:${workplacePath} room:${room}`)

		let socket = socketIO(`http://${host}:${port}/pull?room=${room}`)

		socket.on('onFile', ({path:filePath, text}) => {
			console.info(`${TAG} change ${filePath}`)

			let absFilePath = path.normalize(path.join(workplacePath, filePath))
			if (absFilePath.indexOf(workplacePath) != 0) {
				return console.error(`${TAG} save ${filePath} failed: it is not sub path of ${workplacePath}`)
			}

			fs.outputFile(absFilePath, text, {encoding: 'utf-8'}, err => {
				if (err) return console.error(`${TAG} save ${filePath} failed: ${err}`)
				console.info(`${TAG} sync ${filePath} success`)
			})
		})

		socket.on('connect', callback)
	}
}