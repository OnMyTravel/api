const app = require('../../app/index')
const db = require('../../database')
const expect = require('chai').expect

const chai = require('chai')
const chaiHttp = require('chai-http')
chai.should()
chai.use(chaiHttp)

const encryptionService = require('../../app/application/services/passwordEncryption')

const User = require(require('config').get('app-folder') + '/users/model')

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
          .send({})
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
                }
              ]
            })
          })
      })
    })
  })

  describe('when the user does not exists', () => {
    it('should return a token', () => {
      return chai.request(app)
        .post('/users/register/webapp')
        .send({
          email: 'user-that-does-not-exist@example.net',
          password: 'password'
        })
        .then((response) => {
          expect(response).to.have.property('statusCode', 400)
          expect(response.body).to.deep.equal({
            errors: [{
              code: '400',
              title: 'No account found for these credendials'
            }]
          })
        })
    })
  })

  describe('when the request is complete', () => {
    const password = 'my-brilliant-password'
    const email = 'user-with-credentials@example.net'

    beforeEach(() => {
      return User.create({
        email,
        password: encryptionService(password)
      })
    })

    afterEach(() => {
      return User.deleteMany()
    })

    it('should return a token', () => {
      return chai.request(app)
        .post('/users/register/webapp')
        .send({
          email,
          password
        })
        .then((response) => {
          expect(response).to.have.property('statusCode', 201)
          expect(response.body).to.have.property('token')
        })
    })
  })
})