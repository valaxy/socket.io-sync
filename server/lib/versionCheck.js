const semver = require('semver')

module.exports = {
    isCompatible(clientVersion, serverVersion) {
        let major = semver.major(serverVersion)
        let minor = semver.minor(serverVersion)
        return semver.satisfies(clientVersion, `>= ${major}.0.0`) && semver.satisfies(clientVersion, `< ${major+1}.0.0`)
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
