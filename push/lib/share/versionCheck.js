const semver = require('semver')

module.exports = {
    compare(clientVersion, serverVersion) {
        let clientMajor = semver.major(clientVersion)
        let serverMajor = semver.major(serverVersion)
        return clientMajor - serverMajor
    },

    // not compatible
    isSmaller(v1, v2) {
        let major = semver.major(v2)
        return semver.satisfies(v1, `< ${major}.0.0`)
    },

    isEqual(clientVersion, serverVersion) {
        return semver.satisfies(clientVersion, serverVersion)
    }
}
