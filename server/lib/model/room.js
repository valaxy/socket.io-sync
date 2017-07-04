const LogicError = require('./logicError')
const uuid = require('uuid/v1')

const randomUUID = function() {
    return uuid().replace(/-/g, '')
}

module.exports = class Room {
    get pushCount() { return this._pushCount }

    get pullCount() { return this._pullCount }

    get id() { return this._id }

    get hasClients() { return this._pushCount > 0 || this._pullCount > 0}

    constructor(id) {
        if (id.length < 32) { throw new LogicError(`Expected: length(room id) >= 32; Actual: length(${id}) == ${id.length}. A good sample: ${randomUUID()}`) }

        this._id = id
        this._pushCount = 0
        this._pullCount = 0
    }

    connectPush() {
        if (this._pushCount >= 1) { throw new LogicError(`At most 1 push client in a room`) }
        this._pushCount += 1
    }

    connectPull() {
        if (this._pullCount >= 1) { throw new LogicError(`At most 1 pull client in a room`) }
        this._pullCount += 1
    }

    disconnectPush() {
        this._pushCount -= 1
    }

    disconnectPull() {
        this._pullCount -= 1
    }
}
