const http = require('http')
const socketIO = require('socket.io')
const url = require('url')

const TAG = '[server]'

module.exports = {
	start({serverHost, serverPort, serverPath}, callback) {
		const server = http.createServer()
		const io = socketIO(server)

		io.of('/push').on('connection', socket => {
			let roomID = url.parse(socket.handshake.url, true).query.room
			console.info(`${TAG} connect push: ${roomID}`)

			socket.on('file', ({path, text}) => {
				console.info(`${TAG} change file: ${path}`)
				io.of('/pull').to(roomID).emit('onFile', {path, text})
			})
		})


		io.of('/pull').on('connection', socket => {
			let roomID = url.parse(socket.handshake.url, true).query.room
			console.info(`${TAG} connect pull: ${roomID}`)

			socket.join(roomID)
		})


		server.listen(serverPort, serverHost, (...params) => {
			console.info(`${TAG} server start listen`)
			callback(...params)
		})
	}
}