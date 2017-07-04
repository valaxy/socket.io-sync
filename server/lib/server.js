const http = require('http')
const socketIO = require('socket.io')
const url = require('url')
const log = require('log4js').getLogger('protocol')
const pkg = require('../package')
const App = require('./model/app')
const LogicError = require('./model/logicError')
const PushProtocol = require('./protocol/pushProtocol')

// version, server -> pull
// version, server -> push
// file,    push   -> server
// file,    server -> pull
// end,     push   -> server
// end,     server -> pull

const getRoomID = function(socket) {
    return url.parse(socket.handshake.url, true).query.room
}

const app = new App

module.exports = {
	start({host, port}, callback) {
		const server = http.createServer()
		const io = socketIO(server)

		io.of('/push').on('connection', (socket) => {
			let roomID = getRoomID(socket)
            let protocol = new PushProtocol(socket)
            log.info(`connect push: ${socket.id}, room: ${roomID}`)

            // check connect
            try {
                app.connectPush(roomID)
            } catch (e) {
                if (e instanceof LogicError) {
                    log.error(`connect push fail: ${e.message}`)
                    protocol.emitLog(e.message, 'error')
                    protocol.disconnect()
                    return
                } else {
                    throw e
                }
            }


            socket.join(roomID)
            let room = app.getRoom(roomID)

			socket.on('file', ({path, text}, ack) => {
				log.info(`push file: ${path}`)
				io.of('/pull').to(roomID).emit('file', {path, text})
                ack()
			})

            socket.on('end', () => {
                io.of('/pull').to(roomID).emit('end')
            })

            socket.on('disconnect', () => {
                app.disconnectPush(roomID)
                log.info(`disconnect push: ${socket.id}`)
            })

            // once connect, the push should check it's version
            socket.emit('init', {
                version: pkg.version,
                pushCount: room.pushCount,
                pullCount: room.pullCount
            })

            io.of('/push').to(roomID).emit('info', {
                pushCount: room.pushCount,
                pullCount: room.pullCount
            })

            io.to(roomID).emit('info', {
                pushCount: room.pushCount,
                pullCount: room.pullCount
            })
		})


		io.of('/pull').on('connection', socket => {
			let roomID = getRoomID(socket)
            log.info(`connect pull: ${socket.id}, room: ${roomID}`)

            try {
                app.connectPull(roomID)
            } catch (e) {
                if (e instanceof LogicError) {
                    log.error(`connect pull fail: ${e.message}`)
                    socket.emit('log', { message: e.message, level: 'error' })
                    socket.disconnect(true)
                    return
                } else {
                    throw e
                }
            }

            socket.join(roomID)
            let room = app.getRoom(roomID)

            socket.on('disconnect', () => {
                app.disconnectPull(roomID)
                log.info(`disconnect pull: ${socket.id}`)
            })


            // once connect, the pull should check it's version
            socket.emit('init', {
                version: pkg.version
            })

            io.of('/push').to(roomID).emit('info', {
                pushCount: room.pushCount,
                pullCount: room.pullCount
            })

            io.to(roomID).emit('info', {
                pushCount: room.pushCount,
                pullCount: room.pullCount
            })
		})


		server.listen(port, host, (...params) => {
			log.info(`server start listen: ${host}:${port}`)
            log.info(`server version: ${pkg.version}`)
			callback(...params)
		})
	}
}
