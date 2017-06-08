const http = require('http')
const socketIO = require('socket.io')
const url = require('url')
const log = require('log4js').getLogger('server')
const pkg = require('../package')

// version, server -> pull
// version, server -> push
// file,    push   -> server
// file,    server -> pull
// end,     push   -> server
// end,     server -> pull

module.exports = {
	start({host, port}, callback) {
		const server = http.createServer()
		const io = socketIO(server)

		io.of('/push').on('connection', socket => {
			let roomID = url.parse(socket.handshake.url, true).query.room
			log.info(`connect push: ${socket.id}, room: ${roomID}`)

			socket.on('file', ({path, text}, ack) => {
				log.info(`push file: ${path}`)
				io.of('/pull').to(roomID).emit('file', {path, text})
                ack()
			})

            socket.on('end', () => {
                io.of('/pull').to(roomID).emit('end')
            })

            socket.on('disconnect', () => {
                log.info(`disconnect push: ${socket.id}`)
            })


            // once connect, the push should check it's version
            socket.emit('version', {
                version: pkg.version
            })
		})


		io.of('/pull').on('connection', socket => {
			let roomID = url.parse(socket.handshake.url, true).query.room
			log.info(`connect pull: ${socket.id}, room: ${roomID}`)

            socket.on('disconnect', () => {
                log.info(`disconnect pull: ${socket.id}`)
            })

            socket.join(roomID)

            // once connect, the pull should check it's version
            socket.emit('version', {
                version: pkg.version
            })
		})


		server.listen(port, host, (...params) => {
			log.info(`server start listen: ${host}:${port}`)
			callback(...params)
		})
	}
}
