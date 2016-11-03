const assert = require('chai').assert
const socketIO = require('socket.io-client')
const server = require('../server/server')
const pull = require('../pull/pull')
const path = require('path')

describe('everything', function () {
	it('pull', function (done) {
		server.start({
			host: '127.0.0.1',
			port: 80
		}, () => {
			pull.start({
				host         : '127.0.0.1',
				port         : 80,
				workplacePath: path.join(__dirname, './temp'),
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
