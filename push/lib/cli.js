#!/usr/bin/env node
const commander = require('commander')
const path = require('path')
const pkg = require('../package')
const push = require('./push')
const RuntimeError = require('./runtimeError')
const log = require('log4js').getLogger('push')

const toAbsPath = function (p) {
	return path.isAbsolute(p) ? p : path.join(process.cwd(), p)
}

const checkConfig = function(configPath) {
    if (!configPath) { configPath = 'siosync.js' }
    configPath = toAbsPath(configPath)
    log.info(`config file in ${configPath}`)

    try {
        var config = require(configPath)
    } catch (e) {
        throw new RuntimeError(`config file in ${configPath} wrong: ${e.message}`)
    }

    if (!config.socketHost) { throw new RuntimeError('socketHost must exist in config file') }
    if (!config.socketPort) { throw new RuntimeError('socketPort must exist in config file') }
    if (!config.room)       { throw new RuntimeError('room must exist in config file') }
    if (!config.paths)      { throw new RuntimeError('paths must exist in config file') }

    if (!config.socketPath) { config.socketPath = '/socket.io' }

    return config
}

const main = function () {
	commander
		.version(pkg.version)
		.option('-c --config [path]', 'path of config file')
        .option('-w --watch',         'watch local files changes and continuously push them to server')
		.option('-i --ignoreInitial', "dont't push files when initial, use combining with watch")
		.parse(process.argv)

    try {
        let config = checkConfig(commander.config)
    	config = Object.assign({}, config, {
    		ignoreInitial: commander.ignoreInitial,
            watch: commander.watch
    	})
        push(config)
    } catch (e) {
        if (e instanceof RuntimeError) {
            log.error(e.message)
        } else {
            throw e
        }
    }
}

main()
