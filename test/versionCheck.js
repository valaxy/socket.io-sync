const versionCheck = require('../pull/lib/versionCheck')
const assert = require('chai').assert


describe('versionCheck', function() {
    it('case0', function() {
        assert.isOk(versionCheck.isCompatible('0.0.0', '0.1.0'))
        assert.isOk(!versionCheck.isCompatible('0.0.0', '1.0.0'))
        assert.isOk(versionCheck.isCompatible('1.2.3', '1.4.0'))
        assert.isOk(versionCheck.isCompatible('1.2.3', '1.2.0'))
        assert.isOk(versionCheck.isCompatible('1.2.3', '1.1.99'))
    })
})
