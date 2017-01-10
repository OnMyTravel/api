const Mongoose = require('mongoose')
const Faker = require('faker')
const chai = require('chai')
chai.should()
chai.use(require('sinon-chai'))

const config = require('config')
const Step = require(config.get('app-folder') + '/steps/model')
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
          .then((steps) => {
            steps.should.have.length(1)
            steps[0].message.should.equal(message)
            done()
          })
      })
    })
  })
})
