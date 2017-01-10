/* global describe it */
const config = require('config')
const app = require(config.get('app-root') + '/index')
const Trip = require(config.get('app-folder') + '/trips/model')
const Step = require(config.get('app-folder') + '/steps/model')
const Faker = require('faker')
const mongoose = require('mongoose')
const shared = require(config.get('app-folder') + '/shared')

const chai = require('chai')
const chaiHttp = require('chai-http')
chai.should()
chai.use(chaiHttp)

describe('Steps', () => {
  describe('controller', () => {
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
  })
})
