#!/usr/bin/env node
const commander = require('commander')
const path = require('path')
const pkg = require('../package')
const pull = require('./pull')


let toAbsPath = function (p) {
	return path.isAbsolute(p) ? p : path.join(process.cwd(), p)
}

let parseArgv = function () {
	commander
		.version(pkg.version)
		.option('-c --config [path]', 'path of config file') // 必填
		.parse(process.argv)

	let configPath = toAbsPath(commander.config ? commander.config : 'siosync.js')
	let config = require(configPath)
	config.workplacePath = toAbsPath(config.workplacePath)

	pull.start(config, () => { })
}

parseArgv()