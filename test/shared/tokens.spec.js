const shared = require(require('config').get('app-folder') + '/shared')
const httpMocks = require('node-mocks-http')
const jsonwebtoken = require('jsonwebtoken')
const config = require('config')
const faker = require('faker')

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

    describe('getToken', () => {
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

    describe('decode', () => {
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
