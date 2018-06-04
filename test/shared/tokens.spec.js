const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);

const faker = require('faker')
const config = require('config')
const jsonwebtoken = require('jsonwebtoken')
const httpMocks = require('node-mocks-http')

const tokens = require('../../app/shared/tokens')

describe('Unit | Shared | tokens', () => {

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
    beforeEach(() => {
      sinon.stub(jsonwebtoken, 'sign')
    })

    afterEach(() => {
      jsonwebtoken.sign.restore();
    })

    it('should create a token that expires in 1h', () => {
      // When
      tokens.create('user_id', 'facebook_token')

      // Then
      jsonwebtoken.sign
        .should.have.been.calledWith({ facebook_access_token: 'facebook_token', id: 'user_id' }, config.get('app-secret'), { expiresIn: '1h' })
    })
  })

  describe(':getToken', () => {
    it('checks sanity', () => {
      tokens.getToken.should.be.defined
    })

    it('should return the token', () => {
      // Given
      const token = 'igsb-csbhu-zg!zb-svg'
      var request = httpMocks.createRequest({
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })

      // When
      let result = tokens.getToken(request)

      // then
      result.should.be.equal(token)
    })
  })

  describe(':decode', () => {
    it('checks sanity', () => {
      tokens.decode.should.be.defined
    })

    it('should return decoded payload', () => {
      // When
      let result = tokens.decode(token)

      // Then
      result.should.be.deep.equal(tokenPayload)
    })
  })
})
