#!/usr/bin/env node
const commander = require('commander')
const path = require('path')
const pkg = require('../package')
const push = require('./push')

let parseArgv = function () {
	commander
		.version(pkg.version)
		.option('-c --config [path]', 'path of config file')
		.option('-i --ignoreInitial', 'ignore initial iterate files')
		.parse(process.argv)

	let configPath = commander.config ? commander.config : 'siosync.js'
	configPath = path.isAbsolute(configPath) ? configPath : path.join(process.cwd(), configPath)
	let config = require(configPath)

	push(Object.assign({}, config, {
		ignoreInitial: !!commander.ignoreInitial
	}))
}

parseArgv()