/* global describe, it, before */
const app = require('../../app/index')
const db = require('../../database')
const Faker = require('faker')
const Trip = require('../../app/trips/model')
const shared = require('../../app/shared')

const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')

chai.should()
chai.use(chaiHttp)

describe('Functional | Trips', function () {
  let dbConnexion
  before(() => {
    dbConnexion = db.openDatabaseConnexion()
  })

  after(() => {
    dbConnexion.close()
  })

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

        beforeEach(() => {
          userId = mongoose.Types.ObjectId()
          expectedTrip = {
            name: Faker.lorem.sentence(10),
            owner_id: userId.toString()
          }

          return Trip.create(expectedTrip)
        })

        describe('when the database access is on error', () => {
          before(() => {
            token = shared.tokens.create('', '')
          })

          it('it should return a 400 error', (done) => {
            chai.request(app)
              .get('/trips')
              .set('Authorization', 'Bearer ' + token)
              .end((e, res) => {
                res.should.have.status(400)
                done()
              })
          })
        })

        describe('when there is one trip', () => {
          beforeEach(() => {
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
        it('should return UNAUTHORIZED', (done) => {
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
                message: 'Trip validation failed: name: Path `name` is required.',
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
    })

    describe(':getOne', () => {
      let trip, userId
      beforeEach(() => {
        userId = mongoose.Types.ObjectId()
        return Trip
          .create({ name: Faker.lorem.sentence(10), owner_id: userId.toString() })
          .then((createdTrip) => {
            trip = createdTrip
          })
      })

      it('should return 200 when the trip exists', (done) => {
        chai.request(app)
          .get('/trips/' + trip._id)
          .end((e, res) => {
            res.should.have.status(200)
            res.body.should.have.property('_id', trip._id.toString())
            done()
          })
      })

      it('should return 404 when the trip does not exist', (done) => {
        chai.request(app)
          .get('/trips/' + mongoose.Types.ObjectId())
          .end((e, res) => {
            res.should.have.status(404)
            done()
          })
      })
    })

    describe(':updateOne', () => {
      let trip, userId
      beforeEach(() => {
        userId = mongoose.Types.ObjectId()
        return Trip
          .create({ name: Faker.lorem.sentence(10), owner_id: userId.toString() })
          .then((createdTrip) => {
            trip = createdTrip
          })
      })

      describe('when the user is not authenticated', () => {
        it('should respond UNAUTHORIZED', (done) => {
          chai.request(app)
            .put('/trips/' + trip._id)
            .end((e, res) => {
              res.should.have.status(401)
              done()
            })
        })
      })

      describe('when the user is not allowed to update this trip', () => {
        let token
        before(() => {
          token = shared.tokens.create(mongoose.Types.ObjectId(), '')
        })

        it('should respond FORBIDDEN', (done) => {
          chai.request(app)
            .put('/trips/' + trip._id)
            .set('Authorization', 'Bearer ' + token)
            .end((e, res) => {
              res.should.have.status(403)
              done()
            })
        })
      })

      describe('when the user does not exist', () => {
        let token
        beforeEach(() => {
          token = shared.tokens.create(mongoose.Types.ObjectId(), '')
        })

        it('should respond FORBIDDEN', (done) => {
          chai.request(app)
            .put('/trips/' + mongoose.Types.ObjectId())
            .set('Authorization', 'Bearer ' + token)
            .end((e, res) => {
              res.should.have.status(404)
              done()
            })
        })
      })

      describe('when the user is the trip\'s owner', () => {
        let token
        beforeEach(() => {
          token = shared.tokens.create(userId, '')
        })

        it('should respond 200', (done) => {
          chai.request(app)
            .put('/trips/' + trip._id)
            .set('Authorization', 'Bearer ' + token)
            .send({ name: 'NEW TRIP NAME' })
            .end((e, res) => {
              res.should.have.status(200)

              Trip
                .findById(trip._id)
                .then((trip) => {
                  trip.name.should.be.equal('NEW TRIP NAME')
                  done()
                })
            })
        })

        it('should respond 400 with a wrong payload', (done) => {
          chai.request(app)
            .put('/trips/' + trip._id)
            .set('Authorization', 'Bearer ' + token)
            .send({ name: '' })
            .end((e, res) => {
              res.should.have.status(400)
              done()
            })
        })
      })
    })

    describe(':deleteOne', () => {
      let userId, trip, token
      beforeEach(() => {
        userId = mongoose.Types.ObjectId().toString()
        token = shared.tokens.create(userId, '')
        return Trip
          .create({ name: Faker.lorem.sentence(10), owner_id: userId })
          .then((createdTrip) => {
            trip = createdTrip
          })
      })

      describe('when the user is not connected', () => {
        it('should return UNAUTHORIZED status code', (done) => {
          chai.request(app)
            .delete('/trips/' + trip._id)
            .end((e, res) => {
              res.should.have.status(401)
              done()
            })
        })
      })

      describe('when the is connected', () => {
        describe('when the trip does not exist', () => {
          it('should return a NOT_FOUND status code', (done) => {
            chai.request(app)
              .delete('/trips/' + mongoose.Types.ObjectId().toString())
              .set('Authorization', 'Bearer ' + token)
              .end((e, res) => {
                res.should.have.status(404)
                done()
              })
          })
        })

        describe('when the user is not the trip\'s user', () => {
          it('should return a FORBIDDEN status code', (done) => {
            let otherToken = shared.tokens.create(mongoose.Types.ObjectId().toString(), '')
            chai.request(app)
              .delete('/trips/' + trip._id)
              .set('Authorization', 'Bearer ' + otherToken)
              .end((e, res) => {
                res.should.have.status(403)
                done()
              })
          })
        })
      })
    })
  })
})
