const Mongoose = require('mongoose')
const Faker = require('faker')
const chai = require('chai')
chai.should()
chai.use(require('sinon-chai'))

const config = require('config')
const Step = require(config.get('app-folder') + '/steps/model')
const Trip = require(config.get('app-folder') + '/trips/model')
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
  })
})
