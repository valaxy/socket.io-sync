const BaseProtocol = require('./share/protocol')

module.exports = class Protocol extends BaseProtocol {
    constructor(socket) {
        super(socket)
        this._listen('connect')
        this._listen('disconnect')
        this._listen('file')
        this._listen('end')
        this._listen('version')
    }

    connect(cb) {
        return this._addCallback('connect', cb)
    }

    disconnect(cb) {
        return this._addCallback('disconnect', cb)
    }

    file(cb) {
        return this._addCallback('file', cb)
    }

    end(cb) {
        return this._addCallback('end', cb)
    }

    init(cb) {
        return this._addCallback('version', cb)
    }
}
