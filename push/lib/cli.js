#!/usr/bin/env node
const log4js = require('log4js')

log4js.configure({
    appenders: {
        stdout: { type: 'stdout' },
        stderr: { type: 'stderr' },
        _stdout: { type: 'logLevelFilter', appender: 'stdout', level: 'debug', maxLevel: 'warn' },
        _stderr: { type: 'logLevelFilter', appender: 'stderr', level: 'error' }
    },
    categories: {
        default: { appenders: ['_stdout', '_stderr'], level: 'debug' },
    },
})


const commander = require('commander')
const path = require('path')
const pkg = require('../package')
const push = require('./push')
const RuntimeError = require('./runtimeError')
const log = require('log4js').getLogger('push')

const toAbsPath = function (p) {
    return path.isAbsolute(p) ? p : path.join(process.cwd(), p)
}

const checkConfig = function (configPath) {
    if (!configPath) { configPath = 'siosync.js' }
    configPath = toAbsPath(configPath)
    log.info(`config file: ${configPath}`)

    try {
        var config = require(configPath)
    } catch (e) {
        throw new RuntimeError(`config file in ${configPath} wrong: ${e.message}`)
    }

    if (!config.socketHost) { throw new RuntimeError('socketHost must exist in config file') }
    if (!config.socketPort) { throw new RuntimeError('socketPort must exist in config file') }
    if (!config.room) { throw new RuntimeError('room must exist in config file') }
    if (!config.paths) { throw new RuntimeError('paths must exist in config file') }

    if (!config.socketPath) { config.socketPath = '/socket.io' }
    if (!config.workplacePath) { config.workplacePath = process.cwd() }

    config.workplacePath = toAbsPath(config.workplacePath)

    return config
}

const main = function () {
    commander
        .version(pkg.version)
        .option('-c, --config [path]', 'path of config file')
        .option('-w, --watch', 'watch local files changes and continuously push them to server')
        .option('-i, --ignoreInitial', "dont't push files when initial, use combining with watch")
        .parse(process.argv)


    let config = checkConfig(commander.config)
    config = Object.assign({}, config, {
        ignoreInitial: commander.ignoreInitial,
        watch: commander.watch
    })

    push(config).then(({ code }) => {
        if (code != 0) {
            process.exitCode = code
            log.error(`exit code: ${code}`)
        }
    }).catch(e => {
        log.error(e)
    })
}

main()
