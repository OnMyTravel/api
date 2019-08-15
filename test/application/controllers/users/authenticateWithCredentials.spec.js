const sinon = require('sinon')
const expect = require('chai').expect

const users = require('../../../../app/application/controllers/users')
const useCases = require('../../../../app/domain/use-cases')

const { mockResponseObject } = require('../../../middleware.helper')
const { cleanDatabase } = require('../../../database.helper')

describe('Unit | Controllers | User | authenticateWithCredentials', () => {
    let sandbox
    beforeEach(() => {
        sandbox = sinon.createSandbox()
        sandbox.stub(useCases, 'authenticateWithCredentials').resolves()
    })

    afterEach(() => {
        sandbox.restore()
    })

    it('should start authentication with credentials', () => {
        // Given
        const response = mockResponseObject()
        const requestBody = {
            body: {}
        };

        // When
        users.authenticateWithCredentials(requestBody, response)

        // Then
        expect(useCases.authenticateWithCredentials).to.have.been.called
    })

    it('should format the password', () => {
        // Given
        const response = mockResponseObject()
        const requestBody = {
            body: {
                email: 'email@example.net',
                password: 'my-password'
            }
        };

        // When
        users.authenticateWithCredentials(requestBody, response)

        // Then
        const extracted = useCases.authenticateWithCredentials.callsArg(0)
        expect(extracted).to.have.been.calledWithMatch({
            payload: {
                email: 'email@example.net',
                password: '9c391605eed1afedb0ae9d9a01a0e08eb173ea9d727109c776c250a13c3db6d223d0f72fd8ecf7eae40987bf73548100009f8304900bf7d6a9ea5e2defd04882'
            }
        })
    })
})