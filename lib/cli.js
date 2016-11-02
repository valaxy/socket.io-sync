#!/usr/bin/env node

const commander = require('commander')
const path = require('path')
const fs = require('fs')
const pkg = require('../package')

const pull = require('./pull')
const server = require('./server')
const push = require('./push')

let parseArgv = function () {
	commander
		.version(pkg.version)
		.option('-c --config [path]', 'path of config file') // 必填
		.option('-s --server', 'start server')
		.option('-ph --push', 'push files')
		.option('-pl --pull', 'pull files')
		.parse(process.argv)

	let configPath = commander.config ? commander.config : 'siosync.js'
	configPath = path.isAbsolute(configPath) ? configPath : path.join(process.cwd(), configPath)
	let config = require(configPath)

	if (commander.server) {
		server.start(config)
	} else if (commander.push) {
		push.start(config)
	} else if (commander.pull) {
		pull.start({
			...config,
			workplacePath: process.cwd()
		})
	}
}

parseArgv()