var nock = require('nock')
let app = require('../../index')
let User = require('../../app/users/model')
let facebookResponses = require('./facebook.errors')
let httpStatus = require('http-status-codes')
let config = require('config')
let chai = require('chai')
let chaiHttp = require('chai-http')

let jsonwebtoken = require('jsonwebtoken')

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
      let user

      beforeEach((done) => {
        User.remove({}).exec()
        user = new User({
          name: 'Adrien Saunier',
          email: 'contact.adriensaunier@gmail.com',
          id_facebook: '1168196352'
        })

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
        User.remove({ id_facebook: '1168196352' }).exec()
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

            User.findOne({ id_facebook: '1168196352' })
              .then((foundUser) => {
                foundUser.name.should.equal('Adrien Saunier')
                foundUser.id_facebook.should.equal('1168196352')
                foundUser.email.should.equal('contact.adriensaunier@gmail.com')

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
