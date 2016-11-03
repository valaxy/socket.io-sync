const path = require('path')
const socketIO = require('socket.io-client')
const fs = require('fs-extra')
const log = require('log4js').getLogger('pull')

module.exports = {
	start({
		socketHost,
		socketPort,
		socketPath,
		workplacePath,
		room
		}, callback) {
		workplacePath = path.normalize(workplacePath)
		log.info(`initialize, workplacePath:${workplacePath} room:${room}`)

		let socket = socketIO(`http://${socketHost}:${socketPort}/pull?room=${room}`, {path: socketPath})

		socket.on('connect', () => {
			log.info(`connect to ${socket.io.uri}`)
		})

		socket.on('onFile', ({path:filePath, text}) => {
			log.info(`change ${filePath}`)

			let absFilePath = path.normalize(path.join(workplacePath, filePath))
			if (absFilePath.indexOf(workplacePath) != 0) {
				return log.error(`save ${filePath} failed: it is not sub path of ${workplacePath}`)
			}

			fs.outputFile(absFilePath, text, err => {
				if (err) return log.error(`save ${filePath} failed: ${err}`)
				log.info(`sync ${filePath} success`)
			})
		})

		socket.on('connect', callback)
	}
}