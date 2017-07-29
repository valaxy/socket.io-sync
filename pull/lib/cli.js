#!/usr/bin/env node
const commander = require('commander')
const path = require('path')
const pkg = require('../package')
const pull = require('./pull')
const log = require('log4js').getLogger('pull')

class RuntimeError extends Error { }

const toAbsPath = function (p) {
	return path.normalize(path.isAbsolute(p) ? p : path.join(process.cwd(), p))
}

const configCheck = function(configPath) {
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
    if (!config.workplacePath) { throw new RuntimeError('workplacePath must exist in config file') }

    if (!config.socketPath) { config.socketPath = '/socket.io' }
    if (!config.chmod) { config.chmod = 0o777 }

    config.workplacePath = toAbsPath(config.workplacePath)
    return config
}

const cliCheck = function(options) {
    if (!options.timeout) { options.timeout = 0 }
    return options
}

let main = function () {
	commander
		.version(pkg.version)
		.option('-c --config [path]', 'path of config file')
        .option('-t --timeout [timeout]', 'timeout in milliseconds')
		.parse(process.argv)

    let config = configCheck(commander.config)
    config = cliCheck(Object.assign(config, {
        timeout: commander.timeout
    }))

    log.info(`workplacePath: ${config.workplacePath}`)
    log.info(`room:  ${config.room}`)

    pull.start(Object.assign(config, { }))
}

main()
