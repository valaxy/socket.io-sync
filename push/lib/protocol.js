const BaseProtocol = require('./share/protocol')

module.exports = class Protocol extends BaseProtocol {
    constructor(socket) {
        super(socket)
        this._listen('connect')
        this._listen('disconnect')
        this._listen('log')
        this._listen('init')
        this._listen('info')
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

    log(cb) {
        return this._addCallback('log', cb)
    }

    init(cb) {
        return this._addCallback('init', cb)
    }

    info(cb) {
        return this._addCallback('info', cb)
    }
}
