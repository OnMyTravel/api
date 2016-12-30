const Faker = require('faker')
const chai = require('chai')
chai.should()
chai.use(require('sinon-chai'))

const Trip = require(require('config').get('app-folder') + '/trips/model')
const repository = require(require('config').get('app-folder') + '/trips/repository')

describe('Trip', () => {
  xdescribe('Repository', () => {
    after(() => {
      Trip.remove({}).exec()
    })

    describe(':findById', () => {
      let trip
      before((done) => {
        new Trip({ name: 'My new trip' }).save()
          .then((createdTrip) => {
            trip = createdTrip
            done()
          })
      })

      it('checks sanity', () => {
        repository.should.have.property('findById')
        repository.findById.should.be.a('function')
      })

      it('should return the right ', (done) => {
        // When
        repository.findById(trip._id)
          .then((found, err) => {
            found._id.should.be.deep.equal(trip._id)
            found.name.should.be.equal('My new trip')
            done()
          })
      })
    })

    describe(':create', () => {
      it('checks sanity', () => {
        repository.should.have.property('create')
        repository.create.should.be.a('function')
      })

      it('should return the created trip', (done) => {
        let name = Faker.lorem.sentence()

        repository.create({ name })
          .then((createdTrip) => {
            createdTrip.name.should.be.equal(name)
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
