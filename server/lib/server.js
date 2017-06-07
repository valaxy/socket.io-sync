const http = require('http')
const socketIO = require('socket.io')
const url = require('url')
const log = require('log4js').getLogger('server')
const pkg = require('../package')

module.exports = {
	start({host, port}, callback) {
		const server = http.createServer()
		const io = socketIO(server)

		io.of('/push').on('connection', socket => {
			let roomID = url.parse(socket.handshake.url, true).query.room
			log.info(`connect push: ${roomID}`)

            socket.emit('version', {
                version: pkg.version
            })

			socket.on('file', ({path, text}, ack) => {
				log.info(`push file: ${path}`)
				io.of('/pull').to(roomID).emit('file', {path, text})
                ack()
			})

            socket.on('end', () => {
                io.of('/pull').to(roomID).emit('end')
            })

            socket.on('disconnect', () => {
                log.info(`disconnect push: ${roomID}`)
            })
		})


		io.of('/pull').on('connection', socket => {
			let roomID = url.parse(socket.handshake.url, true).query.room
			log.info(`connect pull: ${roomID}`)

            socket.emit('version', {
                version: pkg.version
            })

            socket.on('disconnect', () => {
                log.info(`disconnect pull: ${roomID}`)
            })

            socket.join(roomID)
		})


		server.listen(port, host, (...params) => {
			log.info(`server start listen`)
			callback(...params)
		})
	}
}
