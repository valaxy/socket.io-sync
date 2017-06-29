module.exports = class Task {
    static get Pending() { return 0 }
    static get Resolved() { return 1 }
    static get Rejected() { return 3 }

    constructor() {
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve
            this._reject = reject
        })

        this._status = Task.Pending
    }

    get status() { return this._status }
    
    get promise() { return this._promise }

    resolve(...params) {
        this._resolve(...params)
        this._status = Task.Resolved
    }

    reject(...params) {
        this._reject(...params)
        this._status = Task.Rejected
    }
}
