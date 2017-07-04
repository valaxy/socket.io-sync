const path = require('path')
const socketIO = require('socket.io-client')
const fs = require('fs-extra')
const log = require('log4js').getLogger('pull')
const pkg = require('../package')
const versionCheck = require('./share/versionCheck')
const Protocol = require('./protocol')


module.exports = {
	start({
		socketHost,
		socketPort,
		socketPath,
        room,
		workplacePath,
        chmod
		}) {
		let socket = socketIO(`http://${socketHost}:${socketPort}/pull?room=${room}`, {path: socketPath})
        let protocol = new Protocol(socket)

		protocol.connect(() => {
			log.info(`connect to ${socket.io.uri}`)
		})

		protocol.file(({path:filePath, text}) => {
			//log.info(`pull ${filePath}`)

			let absFilePath = path.normalize(path.join(workplacePath, filePath))
			if (absFilePath.indexOf(workplacePath) != 0) {
				return log.error(`sync ${filePath} failed: it is not sub path of ${workplacePath}`)
			}

			fs.outputFile(absFilePath, text, {
                mode: chmod
            }, err => {
				if (err) return log.error(`save ${filePath} failed: ${err}`)
				log.info(`sync ${filePath} ${text.length} B`)
			})
		})

        protocol.end(() => {
            log.info('all files push')
            socket.close()
        })

        protocol.init(({version}) => {
            let ret = versionCheck.compare(pkg.version, version)
            if (ret == 0) {
                log.info(`check version success, server: ${version}, client: ${pkg.version}`)
                return
            }

            if (ret < 0) {
                log.error(`server version not match, server: ${version}, client: ${pkg.version}, you should upgrate the client`)
            } else {
                log.error(`server version not match, server: ${version}, client: ${pkg.version}, you should upgrate the server`)
            }
            socket.close()
            process.exit(-1)
        })
	}
}
