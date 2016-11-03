#!/usr/bin/env node
const commander = require('commander')
const path = require('path')
const pkg = require('./package')
const pull = require('./pull')

let parseArgv = function () {
	commander
		.version(pkg.version)
		.option('-c --config [path]', 'path of config file') // 必填
		.parse(process.argv)

	let configPath = commander.config ? commander.config : 'siosync.js'
	configPath = path.isAbsolute(configPath) ? configPath : path.join(process.cwd(), configPath)
	let config = require(configPath)

	pull.start(Object.assign({}, config, {
		workplacePath: process.cwd()
	}), () => { })
}

parseArgv()