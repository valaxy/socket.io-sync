
module.exports = class Room {
    get pushCount() { return this._pushCount }

    get pullCount() { return this._pullCount }

    get id() { return this._id }

    get hasClients() { return this._pushCount > 0 || this._pullCount > 0}

    constructor(id) {
        this._id = id
        this._pushCount = 0
        this._pullCount = 0
    }

    connectPush() {
        this._pushCount += 1
    }

    connectPull() {
        this._pullCount += 1
    }

    disconnectPush() {
        this._pushCount -= 1
    }

    disconnectPull() {
        this._pullCount -= 1
    }
}
