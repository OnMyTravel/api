const moment = require('moment')
const sinon = require('sinon')
const expect = require('chai').expect

const { mockResponseObject } = require('../middleware.helper')

const BadRequestError = require('../../app/domain/BadRequestError')
const handleDomainErrors = require('../../app/application/handleDomainErrors')

describe('Unit | Application | On domain errors', () => {

    it('should respond with a 400 error on Domain error', () => {
        // Given
        const response = mockResponseObject()
        const next = sinon.stub()

        // When
        handleDomainErrors(new BadRequestError(), {}, response)

        // Then
        expect(next).not.to.have.been.called
        expect(response.status).to.have.been.calledWith(400)
    })

    describe('when the error is not from domain', () => {
        it('should transmit to next handler', () => {
            // Given
            const response = mockResponseObject()
            const next = sinon.stub()
            const error = new Error();
    
            // When
            handleDomainErrors(error, {}, response, next)
    
            // Then
            expect(next).to.have.been.calledWith()
            expect(response.status).not.to.have.been.called
        })
    })
})