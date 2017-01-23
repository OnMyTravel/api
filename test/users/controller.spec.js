const nock = require('nock')
const faker = require('faker')
const config = require('config')
const facebookResponses = require('./facebook.errors')
const app = require(config.get('app-root') + '/index')
const User = require(config.get('app-folder') + '/users/model')

const httpStatus = require('http-status-codes')
const jsonwebtoken = require('jsonwebtoken')

const chai = require('chai')
const chaiHttp = require('chai-http')
chai.should()
chai.use(chaiHttp)

const ALLOWEDTOKEN = 'EAACEdEose0cBAKLLwLKSXjs2Xrgd4LdSermEQMhbhUo3qAl8hmj98hB0'
const UNAUTHORIZEDTOKEN = 'EAACEdEose0cBAM8BlABqcgQlCIZCZAZAJgW60opqGtC3iIfg2gZBp6oC'

describe('Users', () => {
  describe('/users/register/facebook', () => {
    describe('when facebook token is wrong', () => {
      beforeEach(() => {
        mockHttpAnswser(facebookResponses.UNAUTHORIZED, UNAUTHORIZEDTOKEN)
      })

      it('should forward the facebook api answer', (done) => {
        chai.request(app)
          .post('/users/register/facebook')
          .send({ access_token: UNAUTHORIZEDTOKEN })
          .end((e, res) => {
            res.statusCode.should.equal(facebookResponses.UNAUTHORIZED.status)
            res.body.should.deep.equal(facebookResponses.UNAUTHORIZED.expectedBody)
            done()
          })
      })
    })

    describe('when no access_token provided', function () {
      it('should return a 400', (done) => {
        chai.request(app)
          .post('/users/register/facebook')
          .send({})
          .end((e, res) => {
            res.body.should.be.deep.equal({
              'error': {
                'name': 'MissingParameter',
                'message': 'access_token must be provided'
              }
            })
            res.statusCode.should.equal(httpStatus.BAD_REQUEST)
            done()
          })
      })
    })

    describe('when the account already exists', () => {
      let user, userData

      beforeEach((done) => {
        User.remove({}).exec()
        userData = {
          name: faker.name.findName(),
          email: faker.internet.email(),
          id_facebook: '1234567891'
        }
        user = new User(userData)

        user.save(() => {
          done()
        })
        mockHttpAnswser(facebookResponses.OK, ALLOWEDTOKEN)
      })

      it('should return an encrypted token', (done) => {
        chai.request(app)
          .post('/users/register/facebook')
          .send({ access_token: ALLOWEDTOKEN })
          .end((e, res) => {
            res.statusCode.should.equal(httpStatus.OK)
            res.body.should.have.property('token')

            var decodedToken = jsonwebtoken.verify(res.body.token, config.get('app-secret'))
            decodedToken.should.have.property('id', '' + user._id)
            decodedToken.should.have.property('facebook_access_token', ALLOWEDTOKEN)
            done()
          })
      })
    })

    describe('when the facebook ID is not registered', () => {
      beforeEach(() => {
        mockHttpAnswser(facebookResponses.OK, ALLOWEDTOKEN)
        User.remove({ id_facebook: '1234567891' }).exec()
      })

      it('should return CREATED', (done) => {
        chai.request(app)
          .post('/users/register/facebook')
          .send({ access_token: ALLOWEDTOKEN })
          .end((e, res) => {
            res.statusCode.should.equal(httpStatus.CREATED)
            res.body.should.have.property('token')

            var decodedToken = jsonwebtoken.verify(res.body.token, config.get('app-secret'))
            decodedToken.should.have.property('facebook_access_token', ALLOWEDTOKEN)

            User.findOne({ id_facebook: '1234567891' })
              .then((foundUser) => {
                foundUser.name.should.equal('On My Travel Support')
                foundUser.id_facebook.should.equal('1234567891')
                foundUser.email.should.equal('contact.onmy@travel.com')

                done()
              })
          })
      })
    })
  })
})

function mockHttpAnswser (answer, token) {
  nock('https://graph.facebook.com', {reqheaders: { 'authorization': 'Bearer ' + token }})
    .get('/v2.8/me?fields=id%2Cname%2Cemail')
    .reply(answer.status, answer.body)
}
