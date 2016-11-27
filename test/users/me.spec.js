const app = require('../../index')
const faker = require('faker')
const User = require('../../app/users/model')
const httpStatus = require('http-status-codes')
const config = require('config')
const chai = require('chai')
const chaiHttp = require('chai-http')

const jsonwebtoken = require('jsonwebtoken')

chai.should()
chai.use(chaiHttp)

describe('Users', () => {
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
      beforeEach((done) => {
        let userData = {
          name: faker.name.findName(),
          email: faker.internet.email(),
          id_facebook: '123456'
        }

        new User(userData).save().then((createdUser) => {
          user = createdUser.toJSON()
          token = jsonwebtoken.sign({
            id: createdUser._id
          }, config.get('app-secret'))
          done()
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
