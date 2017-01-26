const faker = require('faker')
const sinon = require('sinon')
const config = require('config')
const proxyquire = require('proxyquire')
const jsonwebtoken = require('jsonwebtoken')
const httpMocks = require('node-mocks-http')

let mocks = {
  jsonwebtoken: {
    sign: sinon.spy()
  }
}

const shared = require(config.get('app-folder') + '/shared')
const tokens = proxyquire(config.get('app-folder') + '/shared/tokens', mocks)

const chai = require('chai')
chai.should()

describe('Shared', () => {
  describe('tokens', () => {
    let tokenPayload
    let token
    before(() => {
      tokenPayload = {
        name: faker.name.findName(),
        email: faker.internet.email()
      }

      token = jsonwebtoken.sign(tokenPayload, config.get('app-secret'))
    })

    describe(':create', () => {
      it('checks sanity', () => {
        shared.tokens.create.should.be.defined
      })

      it('should create a token that expires in 1h', () => {
        // When
        tokens.create('user_id', 'facebook_token')

        // Then
        mocks.jsonwebtoken.sign
          .should.have.been.calledWith({ facebook_access_token: 'facebook_token', id: 'user_id' }, config.get('app-secret'), { expiresIn: '1h' })
      })
    })

    describe(':getToken', () => {
      it('checks sanity', () => {
        shared.tokens.getToken.should.be.defined
      })

      it('should return the token', () => {
        // Given
        var request = httpMocks.createRequest({
          headers: {
            'Authorization': 'Bearer ' + token
          }
        })

        // When
        let result = shared.tokens.getToken(request)

        // then
        result.should.be.equal(token)
      })
    })

    describe(':decode', () => {
      it('checks sanity', () => {
        shared.tokens.decode.should.be.defined
      })

      it('should return decoded payload', () => {
        // When
        let result = shared.tokens.decode(token)

        // Then
        result.should.be.deep.equal(tokenPayload)
      })
    })
  })
})
