const assert = require('chai').assert
const socketIO = require('socket.io-client')
const server = require('../lib/server')
const pull = require('../lib/pull')
const path = require('path')

describe('everything', function () {
	it('pull', function (done) {
		server.start({
			serverHost: '127.0.0.1',
			serverPort: 80
		}, () => {
			pull.start({
				connectHost  : '127.0.0.1',
				serverPort   : 80,
				workplacePath: path.join(__dirname, '../temp'),
				room         : 'abc'
			}, () => {
				let io = socketIO('http://127.0.0.1/push?room=abc')

				io.emit('file', {
					path: 'a.txt',
					text: 'aab'
				})

				io.emit('file', {
					path: 'a/b.txt',
					text: 'cca'
				})

				setTimeout(done, 500) // 这里要等待一段时间让io生效
			})
		})
	})
})
