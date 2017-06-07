const path = require('path')
const socketIO = require('socket.io-client')
const fs = require('fs-extra')
const log = require('log4js').getLogger('pull')
const pkg = require('../package')

module.exports = {
	start({
		socketHost,
		socketPort,
		socketPath,
		workplacePath,
		room
		}) {
		let socket = socketIO(`http://${socketHost}:${socketPort}/pull?room=${room}`, {path: socketPath})

		socket.on('connect', () => {
			log.info(`connect to ${socket.io.uri}`)
		})

		socket.on('file', ({path:filePath, text}) => {
			//log.info(`pull ${filePath}`)

			let absFilePath = path.normalize(path.join(workplacePath, filePath))
			if (absFilePath.indexOf(workplacePath) != 0) {
				return log.error(`sync ${filePath} failed: it is not sub path of ${workplacePath}`)
			}

			fs.outputFile(absFilePath, text, err => {
				if (err) return log.error(`save ${filePath} failed: ${err}`)
				log.info(`sync ${filePath} success`)
			})
		})

        socket.on('end', () => {
            socket.close()
        })

        socket.on('version', ({version}) => {
            if (version != pkg.version) {
                log.error(`server version not match, server: ${version}, client: ${pkg.version}, you should upgrate the client or server`)
                socket.close()
                process.exit(-1)
            } else {
                log.info('check version success')
            }
        })
	}
}
