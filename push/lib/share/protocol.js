
module.exports = class Protocol {
    constructor(socket) {
        this._socket = socket
        this._callbacks = { }
    }

    _addCallback(name, cb) {
        let cbs
        if (name in this._callbacks) {
            cbs = this._callbacks[name]
        } else {
            cbs = this._callbacks[name] = []
        }
        cbs.push(cb)

        return () => {
            let index = cbs.indexOf(cb)
            cbs.splice(index, 1)
        }
    }

    _listen(name) {
        this._socket.on(name, (...params) => {
            let cbs = this._callbacks[name]
            if (cbs) {
                cbs.forEach(cb => {
                    cb(...params)
                })
            }
        })
    }
}
