const expect = require('chai').expect

const passwordEncryptionService = require('../../../app/application/services/passwordEncryption')

describe('Unit | Application | Services | Password encryption', () => {
    it('should transform any input to a predictable string', () => {
        // Given
        const string = 'my-not-so-strong-password';

        // When
        const alteredString = passwordEncryptionService(string)

        // Then
        expect(alteredString).not.to.equal(string)
        expect(alteredString).to.equal('18776a6f179c38204eb70a7caa3b170a589722998a7d0156d8487135e7b23eb2fb088a641f641b07cfe0fc887cc659b3122e69f44e495094d91a60ab9ae98286')
    })
})