const app = require('../../app/index')
const db = require('../../database')
const faker = require('faker')
const User = require(require('config').get('app-folder') + '/users/model')
const httpStatus = require('http-status-codes')
const config = require('config')
const chai = require('chai')
const chaiHttp = require('chai-http')

const jsonwebtoken = require('jsonwebtoken')

chai.should()
chai.use(chaiHttp)

describe('Functional | Users', () => {
  let connexion
  beforeEach(() => {
    connexion = db.openDatabaseConnexion()
  })

  afterEach(() => {
    connexion.close()
  })

  describe('/me', () => {
    describe('when the access token is not provided', () => {
      it('should require to be authenticated', (done) => {
        chai.request(app)
          .get('/users/me')
          .end((e, res) => {
            res.statusCode.should.equal(httpStatus.UNAUTHORIZED)
            done()
          })
      })
    })

    describe('when a token is provided and valid', () => {
      let user
      let token
      beforeEach(() => {
        let userData = {
          name: faker.name.findName(),
          email: faker.internet.email(),
          id_facebook: '123456'
        }

        return User.create(userData)
          .then((createdUser) => {
            user = createdUser.toJSON()
            token = jsonwebtoken.sign({
              id: createdUser._id
            }, config.get('app-secret'))
          })
      })

      it('should return user informations', (done) => {
        chai.request(app)
          .get('/users/me')
          .set('Authorization', 'Bearer ' + token)
          .end((e, res) => {
            res.statusCode.should.equal(httpStatus.OK)
            res.body._id.should.be.equal('' + user._id)
            res.body.name.should.be.equal(user.name)
            res.body.email.should.be.equal(user.email)
            res.body.id_facebook.should.be.equal(user.id_facebook)
            done()
          })
      })
    })
  })
})
