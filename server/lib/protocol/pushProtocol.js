const ProtocolBase = require('../share/protocol')


module.exports = class Protocol extends ProtocolBase {
    constructor(socket) {
        super(socket)
    }

    emitLog(message, level='info') {
        this._socket.emit('log', { level, message })
    }

    file() {

    }

    disconnect() {
        this._socket.disconnect(true)
    }
}
