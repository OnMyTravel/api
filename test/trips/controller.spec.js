/* global describe, it, before */
const config = require('config')
const app = require(config.get('app-root') + '/index')
const Faker = require('faker')
const Trip = require(config.get('app-folder') + '/trips/model')
const shared = require(config.get('app-folder') + '/shared')

const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')

chai.should()
chai.use(chaiHttp)

describe('Trips', function () {
  describe('controller', function () {
    describe(':getAll', () => {
      describe('when the user is not authenticated', () => {
        it('should answer UNAUTHORIZED', (done) => {
          chai.request(app)
            .get('/trips')
            .end((e, res) => {
              res.should.have.status(401)
              done()
            })
        })
      })

      describe('when the user has correctly authenticated himself', () => {
        let token, userId, expectedTrip

        before(function (done) {
          userId = mongoose.Types.ObjectId()
          expectedTrip = {
            name: Faker.lorem.sentence(10),
            owner_id: userId.toString()
          }

          new Trip(expectedTrip).save((err, data) => {
            done(err)
          })
        })

        describe('when the database access is on error', () => {
          before(() => {
            token = shared.tokens.create('', '')
          })

          it('it should return a 400 error', (done) => {
            chai.request(app)
              .get('/trips')
              .set('Authorization', 'Bearer ' + token)
              .end((err, res) => {
                res.should.have.status(400)
                done()
              })
          })
        })

        describe('when there is one trip', () => {
          before(() => {
            token = shared.tokens.create(userId, '')
          })

          it('it should GET all the trips', (done) => {
            chai.request(app)
              .get('/trips')
              .set('Authorization', 'Bearer ' + token)
              .end((err, res) => {
                if (err) { done(err) }

                res.should.have.status(200)
                res.body.should.be.a('array')
                res.body.length.should.be.eql(1)
                let trip = res.body[0]
                trip.name.should.equal(expectedTrip.name)
                trip.owner_id.should.equal(expectedTrip.owner_id)
                done()
              })
          })
        })
      })
    })

    describe(':create', () => {
      let token
      let userId
      before(() => {
        userId = mongoose.Types.ObjectId().toString()
        token = shared.tokens.create(userId, '')
      })

      describe('when not authenticated', () => {
        it('should return Unauthorized', (done) => {
          chai.request(app)
            .post('/trips')
            .end((e, res) => {
              res.should.have.status(401)
              done()
            })
        })

        it('should add www-authenticate header', (done) => {
          chai.request(app)
            .post('/trips')
            .end((e, res) => {
              res.should.have.status(401)
              res.headers.should.have.property('www-authenticate', 'bearer')
              done()
            })
        })
      })

      describe('when the request payload is incorrect', () => {
        it('should BAD REQUEST', (done) => {
          chai.request(app)
            .post('/trips')
            .set('Authorization', 'Bearer ' + token)
            .send({})
            .end((e, res) => {
              res.should.have.status(400)
              done()
            })
        })

        it('should have a payload', (done) => {
          chai.request(app)
            .post('/trips')
            .set('Authorization', 'Bearer ' + token)
            .send({})
            .end((e, res) => {
              res.should.have.status(400)
              res.body.should.be.deep.equal({
                message: 'Trip validation failed',
                name: 'ValidationError',
                errors: {
                  name: {
                    message: 'Path `name` is required.',
                    kind: 'required'
                  }
                }
              })
              done()
            })
        })
      })

      describe('when the payload is OK', () => {
        it('should return CREATED status', (done) => {
          chai.request(app)
            .post('/trips')
            .set('Authorization', 'Bearer ' + token)
            .send({ name: 'Lorem ipsum' })
            .end((e, res) => {
              res.should.have.status(201)
              done()
            })
        })

        it('should return the created trip, with user as payload', (done) => {
          chai.request(app)
            .post('/trips')
            .set('Authorization', 'Bearer ' + token)
            .send({ name: 'Lorem ipsum' })
            .end((e, res) => {
              res.body.should.have.property('name', 'Lorem ipsum')
              res.body.should.have.property('_id')
              res.body.should.have.property('owner_id', userId)
              done()
            })
        })
      })
    })
  })
})
