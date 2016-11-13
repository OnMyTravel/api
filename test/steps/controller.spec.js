/* global describe it */
var controller = require('../../app/steps/controller')
var expect = require('chai').expect

var httpMocks = require('node-mocks-http')

describe('Steps', function () {
  describe('controller', function () {
    it('checks sanity', function () {
      expect(controller).to.not.be.undefined
    })

    describe(':get', function () {
      describe('when the user is not authenticated', function () {
        it('should return 401', function () {
          // Given
          var request = httpMocks.createRequest({})
          var response = httpMocks.createResponse()

          // When
          controller.get(request, response)

          // Then
          expect(response.statusCode).to.equal(401)
        })

        it('should send WWW-Authenticate header', function () {
          // Given
          var request = httpMocks.createRequest({})
          var response = httpMocks.createResponse()

          // When
          controller.get(request, response)

          // Then
          var headers = response._getHeaders()
          expect(headers).to.have.property('WWW-Authenticate', 'bearer')
        })
      })
    })
  })
})
