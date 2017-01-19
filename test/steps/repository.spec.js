const Mongoose = require('mongoose')
const Faker = require('faker')
const chai = require('chai')
chai.should()
chai.use(require('sinon-chai'))

const config = require('config')
const Step = require(config.get('app-folder') + '/steps/models/step')
const repository = require(config.get('app-folder') + '/steps/repository')

describe('Step', () => {
  describe('Repository', () => {
    after(() => {
      Step.remove({}).exec()
    })

    describe(':create', () => {
      it('checks sanity', () => {
        repository.should.have.property('create')
        repository.create.should.be.a('function')
      })

      it('should return the created trip', (done) => {
        let message = Faker.lorem.sentence()
        let trip_id = Mongoose.Types.ObjectId()
        let image = {
          source: Faker.image.imageUrl(),
          caption: Faker.lorem.sentence()
        }
        let location = {
          label: Faker.lorem.sentence(),
          coordinates: {
            latitude: Faker.random.number(),
            longitude: Faker.random.number()
          }
        }

        repository.create({ message, trip_id, image, location })
          .then((createdTrip) => {
            createdTrip.message.should.be.equal(message)
            createdTrip.trip_id.should.be.equal(trip_id)
            createdTrip.image.source.should.be.equal(image.source)
            createdTrip.image.caption.should.be.equal(image.caption)
            createdTrip.location.label.should.be.equal(location.label)
            createdTrip.location.coordinates.latitude.should.be.equal(location.coordinates.latitude)
            createdTrip.location.coordinates.longitude.should.be.equal(location.coordinates.longitude)
            createdTrip.creation_date.should.not.be.null
            done()
          })
      })

      it('should failed when the model does not respect the validation rules', (done) => {
        repository.create({})
          .then((createdTrip, err) => {
            done(new Error('Mongoose model validation should not succeed'))
          })
          .catch(() => {
            done()
          })
      })
    })

    describe(':findByTripId', () => {
      let firstMessage, thirdMessage, trip_id
      before((done) => {
        firstMessage = Faker.lorem.sentence()
        let messageTwo = Faker.lorem.sentence()
        thirdMessage = Faker.lorem.sentence()
        trip_id = Mongoose.Types.ObjectId()
        Step
          .create([{ trip_id, message: firstMessage }, { trip_id: Mongoose.Types.ObjectId(), message: messageTwo }, { trip_id, message: thirdMessage }])
          .then(() => {
            done()
          })
      })

      it('checks sanity', () => {
        repository.should.have.property('findByTripId')
        repository.findByTripId.should.be.a('function')
      })

      it('should return trip\'s steps', (done) => {
        repository
          .findByTripId(trip_id)
          .then((trips) => {
            trips.should.have.length(2)
            trips[0].trip_id.toString().should.equal(trip_id.toString())
            trips[0].message.should.equal(firstMessage)
            trips[1].trip_id.toString().should.equal(trip_id.toString())
            trips[1].message.should.equal(thirdMessage)
            done()
          })
      })
    })

    describe(':findByTripIdAndStepId', () => {
      let trip_id, step, message
      before((done) => {
        trip_id = Mongoose.Types.ObjectId()
        message = Faker.lorem.sentence()
        Step
          .create([{ message, trip_id }, { message: Faker.lorem.sentence(), trip_id: Mongoose.Types.ObjectId() }])
          .then((createdSteps) => {
            step = createdSteps[0]
            done()
          })
      })

      it('checks sanity', () => {
        repository.should.have.property('findByTripIdAndStepId')
        repository.findByTripIdAndStepId.should.be.a('function')
      })

      it('should return steps', (done) => {
        repository
          .findByTripIdAndStepId(trip_id, step._id)
          .then((step) => {
            step.message.should.equal(message)
            done()
          })
      })
    })

    describe(':deleteById', () => {
      let step
      before((done) => {
        new Step({ message: 'My new trip', trip_id: Mongoose.Types.ObjectId() }).save()
          .then((createdStep) => {
            step = createdStep
            done()
          })
      })

      it('checks sanity', () => {
        repository.should.have.property('deleteById')
        repository.deleteById.should.be.a('function')
      })

      it('should remove the selected step', (done) => {
        repository
          .deleteById(step._id)
          .then(() => {
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

    describe(':updateByTripIdAndStepId', () => {
      let step, tripId
      before((done) => {
        tripId = Mongoose.Types.ObjectId()
        Step
          .create({ message: 'My new trip', trip_id: tripId })
          .then((createdStep) => {
            step = createdStep
            done()
          })
      })

      it('checks sanity', () => {
        repository.should.have.property('updateByTripIdAndStepId')
      })

      it('should partially update the document', (done) => {
        repository
          .updateByTripIdAndStepId(tripId, step._id, { message: 'NEW MESSAGE FOR STEP' })
          .then((data) => {
            Step
              .findById(step._id)
              .then((step) => {
                step.message.should.equal('NEW MESSAGE FOR STEP')
                done()
              })
          }, (er) => {
            done(new Error('Should not fail with an OK payload'))
          })
      })

      it('should return an error when payload is wrong', (done) => {
        repository
          .updateByTripIdAndStepId(tripId, step._id, { trip_id: null })
          .then((data) => {
            done(new Error('Should not succeed with a name null'))
          }, () => {
            done()
          })
      })
    })

    describe(':deleteByTripId', () => {
      let targetedTrip
      beforeEach((done) => {
        targetedTrip = Mongoose.Types.ObjectId()
        let otherTrip = Mongoose.Types.ObjectId()
        Step
          .create([
            { message: 'TRIP ONE - FIRST STEP', trip_id: targetedTrip },
            { message: 'TRIP ONE - SECOND STEP', trip_id: targetedTrip },
            { message: 'TRIP TWO', trip_id: otherTrip },
            { message: 'TRIP ONE - THIRD STEP', trip_id: targetedTrip }
          ])
          .then((createdStep) => {
            done()
          })
      })

      afterEach(() => {
        Step.remove({}).exec()
      })

      it('checks sanity', () => {
        repository.should.have.property('deleteByTripId')
        repository.deleteByTripId.should.be.a('function')
      })

      it('should remove the selected step', (done) => {
        repository
          .deleteByTripId(targetedTrip)
          .then(() => {
            Step
              .find({})
              .then((steps) => {
                steps.should.have.length(1)
                steps[0].message.should.equal('TRIP TWO')

                done()
              })
          })
      })
    })
  })
})
