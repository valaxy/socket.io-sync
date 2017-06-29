const BaseProtocol = require('./share/protocol')

module.exports = class Protocol extends BaseProtocol {
    constructor(socket) {
        super(socket)
        this._listen('connect')
        this._listen('disconnect')
        this._listen('info')
        this._listen('version')
        this._listen('log')
    }

    emitFile(path, text, cb) {
        this._socket.emit('file', {path, text}, cb)
    }

    emitEnd() {
        this._socket.emit('end')
    }

    connect(cb) {
        return this._addCallback('connect', cb)
    }

    disconnect(cb) {
        return this._addCallback('disconnect', cb)
    }

    init(cb) {
        return this._addCallback('version', cb)
    }

    info(cb) {
        return this._addCallback('info', cb)
    }

    log(cb) {
        return this._addCallback('log', cb)
    }
}
