// This is copy from push/lib/log.js
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