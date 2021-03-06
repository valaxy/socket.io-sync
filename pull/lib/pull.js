const path = require('path')
const socketIO = require('socket.io-client')
const fs = require('fs-extra')
const log = require('log4js').getLogger('pull')
const pkg = require('../package')
const versionCheck = require('./share/versionCheck')
const Protocol = require('./protocol')
const code = require('./code')

module.exports = function({
	socketHost,
	socketPort,
	socketPath,
	room,
	workplacePath,
	chmod,
	timeout
	}) {
	return new Promise((resolve, reject) => {
		let socket = socketIO(`http://${socketHost}:${socketPort}/pull?room=${room}`, {path: socketPath})
        let protocol = new Protocol(socket)
        let timeoutHandler
		let exitCode = null

        const end = function(c=code.OK) {
            clearTimeout(timeoutHandler)
			exitCode = c
			socket.close()
        }

		protocol.connect(() => {
			log.info(`connect to ${socket.io.uri}`)
		})

        protocol.disconnect(() => {
            log.info('disconnect')
			if (exitCode == code.OK) {
				resolve()
			} else {
				reject({
					code: exitCode
				})
			}
        })

        protocol.log(({level, message}) => {
            log[level](message)
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
            end()
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

			end(code.VERSION_NOT_MATCH)
        })

        if (timeout > 0) {
            timeoutHandler = setTimeout(() => {
                log.warn(`timeout ${timeout}ms`)
                end(code.TIMEOUT)
            }, timeout)
        }
	})
}
