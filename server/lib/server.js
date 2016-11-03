const http = require('http')
const socketIO = require('socket.io')
const url = require('url')
const log = require('log4js').getLogger('server')

module.exports = {
	start({host, port}, callback) {
		const server = http.createServer()
		const io = socketIO(server)

		io.of('/push').on('connection', socket => {
			let roomID = url.parse(socket.handshake.url, true).query.room
			log.info(`connect push: ${roomID}`)

			socket.on('file', ({path, text}) => {
				log.info(`change file: ${path}`)
				io.of('/pull').to(roomID).emit('onFile', {path, text})
			})
		})


		io.of('/pull').on('connection', socket => {
			let roomID = url.parse(socket.handshake.url, true).query.room
			log.info(`connect pull: ${roomID}`)

			socket.join(roomID)
		})


		server.listen(port, host, (...params) => {
			log.info(`server start listen`)
			callback(...params)
		})
	}
}