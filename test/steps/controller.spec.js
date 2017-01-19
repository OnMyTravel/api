/* global describe it */
const config = require('config')
const app = require(config.get('app-root') + '/index')
const Trip = require(config.get('app-folder') + '/trips/model')
const Step = require(config.get('app-folder') + '/steps/models/step')
const Faker = require('faker')
const mongoose = require('mongoose')
const shared = require(config.get('app-folder') + '/shared')
const fs = require('fs')

const chai = require('chai')
const chaiHttp = require('chai-http')
chai.should()
chai.use(chaiHttp)

describe('Steps', () => {
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
          let token = shared.tokens.create('', '')

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

        before((done) => {
          let name = Faker.lorem.sentence()
          let owner_id = mongoose.Types.ObjectId()
          token = shared.tokens.create(owner_id, '')

          Trip.create({ name, owner_id })
            .then((createdTrip) => {
              trip = createdTrip
              done()
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
          before((done) => {
            Step
              .create({
                trip_id: trip._id,
                message: Faker.lorem.sentence()
              })
              .then((createdStep) => {
                step = createdStep
                done()
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

        before((done) => {
          let name = Faker.lorem.sentence()
          let owner_id = mongoose.Types.ObjectId()
          Trip.create({ name, owner_id })
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

              Step
                .create([firstTripStep, secondTripStep, otherTripStep])
                .then((createdSteps) => {
                  done()
                })
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

      before((done) => {
        userId = mongoose.Types.ObjectId()
        new Trip({
          name: Faker.lorem.sentence(10),
          owner_id: userId.toString()
        }).save((e, createdTrip) => {
          trip = createdTrip
          done(e)
        })
      })

      beforeEach(() => {
        token = shared.tokens.create(userId, '')
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
              .send({ message: 'A super message', image: { caption: 'MY CAPTION' } })
              .set('Authorization', 'Bearer ' + token)
              .end((e, res) => {
                res.should.have.status(200)
                res.body.message.should.equal('A super message')
                res.body.image.caption.should.equal('MY CAPTION')
                res.body.trip_id.should.equal(trip._id.toString())
                done()
              })
          })
        })
      })
    })

    describe(':updateOne', () => {
      let userId, trip, step, token

      before((done) => {
        userId = mongoose.Types.ObjectId()
        token = shared.tokens.create(userId, '')
        Trip.create({
          name: Faker.lorem.sentence(10),
          owner_id: userId.toString()
        }).then((createdTrip) => {
          trip = createdTrip

          Step
            .create({ message: Faker.lorem.sentence(10), trip_id: createdTrip._id })
            .then((createdStep) => {
              step = createdStep
              done()
            })
        }, (e) => {
          done(e)
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

              before((done) => {
                Step
                  .create({ message: Faker.lorem.sentence(10), trip_id: mongoose.Types.ObjectId().toString() })
                  .then((createdStep) => {
                    step = createdStep
                    done()
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
              .send({ message: 'A super message', image: { caption: 'MY CAPTION' } })
              .set('Authorization', 'Bearer ' + token)
              .end((e, res) => {
                res.should.have.status(200)
                res.body.message.should.equal('A super message')
                res.body.image.caption.should.equal('MY CAPTION')

                Step
                  .findById(step._id)
                  .then((step) => {
                    step.message.should.equal('A super message')
                    step.image.caption.should.equal('MY CAPTION')
                    step.trip_id.toString().should.equal(trip._id.toString())

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
