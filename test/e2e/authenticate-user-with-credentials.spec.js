const app = require('../../app/index')
const db = require('../../database')
const expect = require('chai').expect

const chai = require('chai')
const chaiHttp = require('chai-http')
chai.should()
chai.use(chaiHttp)

describe('Functionnal | Account | Authenticate a user using credentials', () => {
    let connexion
    before(() => {
        connexion = db.openDatabaseConnexion()
    })

    after(() => {
        return connexion.close()
    })

    describe('when some credentials are missing', () => {
        it('should return a bad request error', () => {
            return chai.request(app)
                .post('/users/register/webapp')
                .send({})
                .then((response) => {
                    expect(response).to.have.property('statusCode', 400)
                })
        })

        describe('when the email is not given', () => {
            it('should return an error message to explain', () => {
                return chai.request(app)
                    .post('/users/register/webapp')
                    .send({
                        password: 'password'
                    })
                    .then((response) => {
                        expect(response).to.have.property('statusCode', 400)
                        expect(response.body).to.deep.equal({
                            errors: [{
                                code: '400',
                                title: 'No email received'
                            }]
                        })
                    })
            })
        })
        
        describe('when no password given', () => {
            it('should return an error message to explain', () => {
                return chai.request(app)
                    .post('/users/register/webapp')
                    .send({
                        email: 'email@example.net'
                    })
                    .then((response) => {
                        expect(response).to.have.property('statusCode', 400)
                        expect(response.body).to.deep.equal({
                            errors: [{
                                code: '400',
                                title: 'No password received'
                            }]
                        })
                    })
            })
        })

        describe('when both missing', () => {
            it('should return an error message to explain', () => {
                return chai.request(app)
                    .post('/users/register/webapp')
                    .send({
                    })
                    .then((response) => {
                        expect(response).to.have.property('statusCode', 400)
                        expect(response.body).to.deep.equal({
                            errors: [{
                                code: '400',
                                title: 'No email received'
                            },
                            {
                                code: '400',
                                title: 'No password received'
                            }]
                        })
                    })
            })
        })
    })

    /*   describe('/users/register/facebook', () => {
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
          it('should return a 400', () => {
            // when
            const request = chai.request(app)
              .post('/users/register/facebook')
              .send({})

            return request.then((res) => {
              res.body.should.be.deep.equal({
                'error': {
                  'name': 'MissingParameter',
                  'message': 'access_token must be provided'
                }
              })
              res.statusCode.should.equal(httpStatus.BAD_REQUEST)
            })
          })
        })

        describe('when the account already exists', () => {
          let user, userData

          beforeEach(() => {
            userData = {
              name: faker.name.findName(),
              email: faker.internet.email(),
              id_facebook: '1234567891'
            }
            return User.create(userData)
              .then(createdUser => {
                user = createdUser
                mockHttpAnswser(facebookResponses.OK, ALLOWEDTOKEN)
              })
          })

          afterEach(() => {
            return User.deleteMany({})
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
          })

          afterEach(() => {
            User.deleteMany({ id_facebook: '1234567891' }).exec()
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
      }) */
})

function mockHttpAnswser(answer, token) {
    nock('https://graph.facebook.com', {
            reqheaders: {
                'authorization': 'Bearer ' + token
            }
        })
        .get('/v2.8/me?fields=id%2Cname%2Cemail')
        .reply(answer.status, answer.body)
}