const config = require('config')
const shared = require(config.get('app-folder') + '/shared')
const jsonwebtoken = require('jsonwebtoken')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const httpMocks = require('node-mocks-http')

const chai = require('chai')
chai.should()
chai.use(sinonChai)

describe('Shared', () => {
  describe('isAuthenticated', () => {
    it('checks sanity', () => {
      shared.isAuthenticated.should.exist
    })

    describe('when no token is given', () => {
      it('should not call next', function () {
        // Given
        var request = httpMocks.createRequest({})
        var response = httpMocks.createResponse()
        var next = sinon.spy()

        // When
        shared.isAuthenticated(request, response, next)

        // Then
        next.should.not.have.been.called
        response.statusCode.should.be.equal(401)
      })
    })

    describe('when token is given in header', () => {
      describe('when token is valid', () => {
        var token
        before(() => {
          token = jsonwebtoken.sign({}, config.get('app-secret'))
        })

        it('should call next if everything is ok', function () {
          // Given
          var request = httpMocks.createRequest({
            headers: {
              'Authorization': 'Bearer ' + token
            }
          })
          var response = httpMocks.createResponse()
          var next = sinon.spy()

          // When
          shared.isAuthenticated(request, response, next)

          // Then
          next.should.have.been.called
        })
      })

      describe('when token has already expired', () => {
        let token
        let request
        let response

        before(() => {
          token = jsonwebtoken.sign({exp: 0}, config.get('app-secret'))
        })

        beforeEach(() => {
          request = httpMocks.createRequest({
            headers: {
              'Authorization': 'Bearer ' + token
            }
          })
          response = httpMocks.createResponse()
        })

        it('should not call next and send 400 response', function () {
          // Given
          var next = sinon.spy()

          // When
          shared.isAuthenticated(request, response, next)

          // Then
          next.should.not.have.been.called
          response.statusCode.should.be.equal(400)

          var data = JSON.parse(response._getData())
          data.should.be.deep.equal({
            'error': {
              'name': 'TokenExpiredError',
              'message': 'jwt expired'
            }
          })
        })

        it('should send an www-authenticate header', () => {
          // Given
          var next = sinon.spy()

          // When
          shared.isAuthenticated(request, response, next)

          // Then
          next.should.not.have.been.called
          const headers = response._getHeaders()
          headers.should.have.a.property('www-authenticate')
        })
      })
    })
  })
})
