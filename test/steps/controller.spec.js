/* global describe it */
const app = require('../../app/index')
const db = require('../../database')
const { Trip } = require('../../app/models')
const Step = require('../../app/steps/models/step')
const Faker = require('faker')
const mongoose = require('mongoose')
const shared = require('../../app/shared')

const chai = require('chai')
const chaiHttp = require('chai-http')
chai.should()
chai.use(chaiHttp)

describe('Functional | Steps', () => {
  let dbConnexion
  beforeEach(() => {
    dbConnexion = db.openDatabaseConnexion()
  })

  afterEach(() => {
    return dbConnexion.close()
  })

  describe('controller', () => {
    describe(':deleteOne', () => {
      describe('when the user is not authenticated', () => {
        it('should return UNAUTHORIZED', (done) => {
          chai.request(app)
            .delete('/trips/' + mongoose.Types.ObjectId() + '/steps/' + mongoose.Types.ObjectId())
            .end((e, res) => {
              res.should.have.status(401)
              done()
            })
        })
      })

      describe('when the trip does not exist', () => {
        it('should return NOT_FOUND', (done) => {
          let token = shared.tokens.create(mongoose.Types.ObjectId().toString(), '')

          chai.request(app)
            .delete('/trips/' + mongoose.Types.ObjectId() + '/steps/' + mongoose.Types.ObjectId())
            .set('Authorization', 'Bearer ' + token)
            .end((e, res) => {
              res.should.have.status(404)
              done()
            })
        })
      })

      describe('when the trip exists', () => {
        let trip, token

        beforeEach(() => {
          let name = Faker.lorem.sentence()
          let ownerId = mongoose.Types.ObjectId()
          token = shared.tokens.create(ownerId, '')

          return Trip.create({ name, owner_id: ownerId })
            .then((createdTrip) => {
              trip = createdTrip
            })
        })

        describe('but it is not the user\'s', () => {
          it('should return FORBIDDEN', (done) => {
            let token = shared.tokens.create('', '')
            chai.request(app)
              .delete('/trips/' + trip._id + '/steps/' + mongoose.Types.ObjectId())
              .set('Authorization', 'Bearer ' + token)
              .end((e, res) => {
                res.should.have.status(403)
                done()
              })
          })
        })

        describe('but the step does not exist', () => {
          it('should return NOT_FOUND', (done) => {
            chai.request(app)
              .delete('/trips/' + trip._id + '/steps/' + mongoose.Types.ObjectId())
              .set('Authorization', 'Bearer ' + token)
              .end((e, res) => {
                res.should.have.status(404)
                done()
              })
          })
        })

        describe('and the step exists', () => {
          let step
          beforeEach(() => {
            return Step
              .create({
                trip_id: trip._id,
                message: Faker.lorem.sentence()
              })
              .then((createdStep) => {
                step = createdStep
              })
          })

          it('should return OK', (done) => {
            chai.request(app)
              .delete('/trips/' + trip._id + '/steps/' + step._id)
              .set('Authorization', 'Bearer ' + token)
              .end((e, res) => {
                res.should.have.status(200)
                Step
                  .findById(step._id)
                  .then((step) => {
                    if (step) {
                      done(new Error('Step should have been removed'))
                    } else {
                      done()
                    }
                  })
              })
          })
        })
      })
    })

    describe(':get', () => {
      describe('when the trip does not exists', () => {
        it('should return NOT_FOUND', (done) => {
          chai.request(app)
            .get('/trips/' + mongoose.Types.ObjectId() + '/steps')
            .end((e, res) => {
              res.should.have.status(404)
              done()
            })
        })
      })

      describe('when the trip exists', () => {
        let trip, firstTripStep, secondTripStep

        beforeEach(() => {
          let name = Faker.lorem.sentence()
          let ownerId = mongoose.Types.ObjectId()

          return Trip.create({ name, owner_id: ownerId })
            .then((createdTrip) => {
              trip = createdTrip

              firstTripStep = {
                trip_id: trip._id,
                message: Faker.lorem.sentence()
              }
              secondTripStep = {
                trip_id: trip._id,
                message: Faker.lorem.sentence()
              }
              let otherTripStep = {
                trip_id: mongoose.Types.ObjectId(),
                message: Faker.lorem.sentence()
              }

              return Step
                .create([firstTripStep, secondTripStep, otherTripStep])
            })
        })

        it('should return OK', (done) => {
          chai.request(app)
            .get('/trips/' + trip._id + '/steps')
            .end((e, res) => {
              res.should.have.status(200)
              done()
            })
        })

        it('should return trip\'s steps', (done) => {
          chai.request(app)
            .get('/trips/' + trip._id + '/steps')
            .end((e, res) => {
              res.should.have.status(200)
              res.body.should.have.length(2)
              done()
            })
        })
      })
    })

    describe(':create', () => {
      let userId, trip, token

      beforeEach(() => {
        userId = mongoose.Types.ObjectId()

        token = shared.tokens.create(userId, '')

        return Trip.create({
          name: Faker.lorem.sentence(10),
          owner_id: userId.toString()
        }).then((createdTrip) => {
          trip = createdTrip
        })
      })

      describe('when the user is not authenticated', () => {
        it('should return UNAUTHORIZED', (done) => {
          chai.request(app)
            .post('/trips/' + trip._id + '/steps')
            .end((e, res) => {
              res.should.have.status(401)
              done()
            })
        })
      })

      describe('when the trip does not exist', () => {
        it('should return NOT_FOUND', (done) => {
          chai.request(app)
            .post('/trips/' + mongoose.Types.ObjectId() + '/steps')
            .set('Authorization', 'Bearer ' + token)
            .end((e, res) => {
              res.should.have.status(404)
              done()
            })
        })
      })

      describe('when the trip exists', () => {
        describe('but the user is not the owner', () => {
          it('should return FORBIDDEN', (done) => {
            let token = shared.tokens.create(mongoose.Types.ObjectId(), '')
            chai.request(app)
              .post('/trips/' + trip._id + '/steps')
              .set('Authorization', 'Bearer ' + token)
              .end((e, res) => {
                res.should.have.status(403)
                done()
              })
          })
        })

        describe('and the user is the owner', () => {
          it('should create the steps', (done) => {
            chai.request(app)
              .post('/trips/' + trip._id + '/steps')
              .send({ message: 'A super message' })
              .set('Authorization', 'Bearer ' + token)
              .end((e, res) => {
                res.should.have.status(200)
                res.body.message.should.equal('A super message')
                res.body.trip_id.should.equal(trip._id.toString())

                Step
                  .findById(res.body._id)
                  .then((step) => {
                    step._id.toString().should.equal(res.body._id)
                    step.message.should.equal('A super message')
                    step.trip_id.toString().should.equal(trip._id.toString())

                    done()
                  })
              })
          })

          it('should not set an image on the initial creation', (done) => {
            chai.request(app)
              .post('/trips/' + trip._id + '/steps')
              .send({ message: 'A super message', gallery: [{ source: 'MY SOURCE' }] })
              .set('Authorization', 'Bearer ' + token)
              .end((e, res) => {
                res.should.have.status(200)
                res.body.message.should.equal('A super message')
                res.body.trip_id.should.equal(trip._id.toString())

                Step
                  .findById(res.body._id)
                  .then((step) => {
                    step._id.toString().should.equal(res.body._id)
                    step.message.should.equal('A super message')
                    step.gallery.should.have.length(0)
                    step.trip_id.toString().should.equal(trip._id.toString())

                    done()
                  })
              })
          })
        })
      })
    })

    describe(':attach', () => {
      describe('when the user is not authenticated', () => {
        it('should return UNAUTHORIZED', (done) => {
          chai.request(app)
            .post('/trips/' + mongoose.Types.ObjectId() + '/steps/' + mongoose.Types.ObjectId() + '/attach')
            .end((e, res) => {
              res.should.have.status(401)
              done()
            })
        })
      })

      describe('when the trip does not exists', () => {
        let token
        before(() => {
          token = shared.tokens.create(mongoose.Types.ObjectId().toString(), '')
        })

        it('should return NOT_FOUND', (done) => {
          chai.request(app)
            .post('/trips/' + mongoose.Types.ObjectId() + '/steps/' + mongoose.Types.ObjectId() + '/attach')
            .set('Authorization', 'Bearer ' + token)
            .end((e, res) => {
              res.should.have.status(404)
              done()
            })
        })
      })

      describe('when the trip exists', () => {
        let userId, trip
        beforeEach(() => {
          userId = mongoose.Types.ObjectId()

          return Trip.create({
            name: Faker.lorem.sentence(10),
            owner_id: userId.toString()
          }).then((createdTrip) => {
            trip = createdTrip
          })
        })

        describe('but is not editable', () => {
          it('should return FORBIDDEN', (done) => {
            let token = shared.tokens.create(mongoose.Types.ObjectId().toString(), '')

            chai.request(app)
              .post('/trips/' + trip._id + '/steps/' + mongoose.Types.ObjectId() + '/attach')
              .set('Authorization', 'Bearer ' + token)
              .end((e, res) => {
                res.should.have.status(403)
                done()
              })
          })
        })

        describe('and it is editable', () => {
          let token
          beforeEach(() => {
            token = shared.tokens.create(userId.toString(), '')
          })

          describe('but the step does not exist', () => {
            it('should return NOT FOUND', (done) => {
              chai.request(app)
                .post('/trips/' + trip._id + '/steps/' + mongoose.Types.ObjectId() + '/attach')
                .set('Authorization', 'Bearer ' + token)
                .end((e, res) => {
                  res.should.have.status(404)
                  done()
                })
            })
          })

          describe('and the step exists', () => {
            let step
            beforeEach(() => {
              return Step
                .create({ message: Faker.lorem.sentence(10), trip_id: trip._id })
                .then((createdStep) => {
                  step = createdStep
                })
            })

            it('requires an image to be sent', (done) => {
              chai.request(app)
                .post('/trips/' + trip._id + '/steps/' + step._id + '/attach')
                .set('Authorization', 'Bearer ' + token)
                .end((e, res) => {
                  res.should.have.status(400)
                  done()
                })
            })
          })
        })
      })
    })

    describe(':updateOne', () => {
      let userId, trip, step, token

      beforeEach(() => {
        userId = mongoose.Types.ObjectId()
        token = shared.tokens.create(userId, '')

        return Trip.create({
          name: Faker.lorem.sentence(10),
          owner_id: userId.toString()
        }).then((createdTrip) => {
          trip = createdTrip

          return Step
            .create({
              message: Faker.lorem.sentence(10),
              trip_id: createdTrip._id,
              location: { label: Faker.lorem.sentence(10) }
            })
            .then((createdStep) => {
              step = createdStep
            })
        })
      })

      describe('when the client is not authenticated', () => {
        it('should return UNAUTHORIZED', (done) => {
          chai.request(app)
            .put('/trips/' + trip._id + '/steps/' + step._id)
            .end((e, res) => {
              res.should.have.status(401)
              done()
            })
        })
      })

      describe('when the client is authenticated', () => {
        describe('and the trip does not exist', () => {
          it('shoud return NOT_FOUND', (done) => {
            chai.request(app)
              .put('/trips/' + mongoose.Types.ObjectId().toString() + '/steps/' + mongoose.Types.ObjectId().toString())
              .set('Authorization', 'Bearer ' + token)
              .end((e, res) => {
                res.should.have.status(404)
                done()
              })
          })
        })

        describe('and the trip exists', () => {
          describe('but the client is not allowed to edit it', () => {
            it('shoud return FORBIDDEN', (done) => {
              let token = shared.tokens.create(mongoose.Types.ObjectId().toString(), '')

              chai.request(app)
                .put('/trips/' + trip._id + '/steps/' + mongoose.Types.ObjectId().toString())
                .set('Authorization', 'Bearer ' + token)
                .end((e, res) => {
                  res.should.have.status(403)
                  done()
                })
            })
          })

          describe('and the step does not exists', () => {
            it('shoud return NOT_FOUND', (done) => {
              chai.request(app)
                .put('/trips/' + trip._id + '/steps/' + mongoose.Types.ObjectId().toString())
                .set('Authorization', 'Bearer ' + token)
                .end((e, res) => {
                  res.should.have.status(404)
                  done()
                })
            })
          })

          describe('and the step exists', () => {
            describe('but it is related to another trip', () => {
              let step
              beforeEach(() => {
                return Step
                  .create({ message: Faker.lorem.sentence(10), trip_id: mongoose.Types.ObjectId().toString() })
                  .then((createdStep) => {
                    step = createdStep
                  })
              })

              it('should return 404', (done) => {
                chai.request(app)
                  .put('/trips/' + trip._id + '/steps/' + step._id)
                  .set('Authorization', 'Bearer ' + token)
                  .end((e, res) => {
                    res.should.have.status(404)
                    done()
                  })
              })
            })
          })

          it('should return OK', (done) => {
            chai.request(app)
              .put('/trips/' + trip._id + '/steps/' + step._id)
              .send({ message: 'A super message' })
              .set('Authorization', 'Bearer ' + token)
              .end((e, res) => {
                res.should.have.status(200)
                res.body.message.should.equal('A super message')

                Step
                  .findById(step._id)
                  .then((step) => {
                    step.message.should.equal('A super message')
                    step.trip_id.toString().should.equal(trip._id.toString())

                    done()
                  })
              })
          })

          it('should should not update the gallery', (done) => {
            chai.request(app)
              .put('/trips/' + trip._id + '/steps/' + step._id)
              .send({ message: 'A super message', gallery: [{ source: 'src:myimage.jpg' }] })
              .set('Authorization', 'Bearer ' + token)
              .end((e, res) => {
                res.should.have.status(200)
                res.body.message.should.equal('A super message')
                res.body.gallery.should.have.length(0)
                res.body.location.label.should.equal(step.location.label)

                Step
                  .findById(step._id)
                  .then((step) => {
                    step.message.should.equal('A super message')
                    step.trip_id.toString().should.equal(trip._id.toString())
                    step.gallery.should.have.length(0)

                    done()
                  })
              })
          })

          it('should not update the trip_id, even if it is asked', (done) => {
            let newTripId = mongoose.Types.ObjectId()
            let message = Faker.lorem.sentence(10)

            chai.request(app)
              .put('/trips/' + trip._id + '/steps/' + step._id)
              .send({ trip_id: newTripId.toString(), message })
              .set('Authorization', 'Bearer ' + token)
              .end((e, res) => {
                res.should.have.status(200)
                res.body.message.should.equal(message)

                Step
                  .findById(step._id)
                  .then((step) => {
                    step.message.should.equal(message)
                    step.trip_id.toString().should.equal(trip._id.toString())

                    done()
                  })
              })
          })
        })
      })
    })
  })
})
