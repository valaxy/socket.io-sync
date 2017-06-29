const Room = require('./room')
const log = require('log4js').getLogger('server')


module.exports = class App {
    constructor() {
        this._rooms = { }
    }

    _makeRoomExist(roomID) {
        if (!(roomID in this._rooms)) {
            this._rooms[roomID] = new Room(roomID)
            log.info(`create room: ${roomID}`)
        }

        return this._rooms[roomID]
    }

    _disposeRoomIfNeed(room) {
        if (!room.hasClients) {
            delete this._rooms[room.id]
            log.info(`dispose room: ${room.id}`)
        }
    }

    getRoom(id) {
        return this._rooms[id]
    }

    connectPull(roomID) {
        let room = this._makeRoomExist(roomID)
        room.connectPull()
    }

    connectPush(roomID) {
        let room = this._makeRoomExist(roomID)
        room.connectPush()
    }

    disconnectPull(roomID) {
        let room = this.getRoom(roomID)
        room.disconnectPull()
        this._disposeRoomIfNeed(room)
    }

    disconnectPush(roomID) {
        let room = this.getRoom(roomID)
        room.disconnectPush()
        this._disposeRoomIfNeed(room)
    }
}
