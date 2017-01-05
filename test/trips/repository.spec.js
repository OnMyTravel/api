const Mongoose = require('mongoose')
const Faker = require('faker')
const chai = require('chai')
chai.should()
chai.use(require('sinon-chai'))

const config = require('config')
const Trip = require(config.get('app-folder') + '/trips/model')
const repository = require(config.get('app-folder') + '/trips/repository')

describe('Trip', () => {
  describe('Repository', () => {
    after(() => {
      Trip.remove({}).exec()
    })

    describe(':findById', () => {
      let trip
      before((done) => {
        new Trip({ name: 'My new trip', owner_id: Mongoose.Types.ObjectId() }).save()
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
        let owner_id = Mongoose.Types.ObjectId()

        repository.create({ name, owner_id })
          .then((createdTrip) => {
            createdTrip.name.should.be.equal(name)
            createdTrip.owner_id.should.be.equal(owner_id)
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

    describe(':findByOwnerId', () => {
      let owner_id, another_owner_id
      let nameOne, nameTwo, nameThree
      before((done) => {
        nameOne = Faker.lorem.sentence()
        nameTwo = Faker.lorem.sentence()
        nameThree = Faker.lorem.sentence()
        owner_id = Mongoose.Types.ObjectId()
        another_owner_id = Mongoose.Types.ObjectId()

        Trip.create([{ name: nameOne, owner_id }, { name: nameTwo, owner_id: another_owner_id }, { name: nameThree, owner_id }])
          .then((createdTrip) => {
            done()
          })
      })

      it('checks sanity', () => {
        repository.should.have.property('findByOwnerId')
        repository.findByOwnerId.should.be.a('function')
      })

      it('should return one trip', (done) => {
        repository
          .findByOwnerId(owner_id)
          .then((foundTrips) => {
            foundTrips.should.have.length(2)
            foundTrips[0].name.should.equal(nameOne)
            foundTrips[0].owner_id.toString().should.equal(owner_id.toString())
            foundTrips[1].name.should.equal(nameThree)
            foundTrips[1].owner_id.toString().should.equal(owner_id.toString())
            done()
          })
      })
    })

    describe(':updateByIdAndOwnerId', () => {
      let trip, ownerId
      before((done) => {
        ownerId = Mongoose.Types.ObjectId()
        new Trip({ name: 'My new trip', owner_id: ownerId }).save()
          .then((createdTrip) => {
            trip = createdTrip
            done()
          })
      })

      it('checks sanity', () => {
        repository.should.have.property('updateByIdAndOwnerId')
      })

      it('should partially update the document', (done) => {
        repository
          .updateByIdAndOwnerId(trip._id, ownerId, {name: 'NEW TRIP NAME'})
          .then((data) => {
            Trip
              .findById(trip._id)
              .then((trip) => {
                trip.name.should.equal('NEW TRIP NAME')
                done()
              })
          }, (er) => {
            done(new Error('Should not fail with an OK payload'))
          })
      })

      it('should return an error when payload is wrong', (done) => {
        repository
          .updateByIdAndOwnerId(trip._id, null, {name: null})
          .then((data) => {
            done(new Error('Should not succeed with a name null'))
          }, () => {
            done()
          })
      })
    })

    describe(':deleteById', () => {
      let trip
      before((done) => {
        new Trip({ name: 'My new trip', owner_id: Mongoose.Types.ObjectId() }).save()
          .then((createdTrip) => {
            trip = createdTrip
            done()
          })
      })

      it('checks sanity', () => {
        repository.should.have.property('deleteById')
        repository.deleteById.should.be.a('function')
      })

      it('should remove the selected trip', (done) => {
        repository
          .deleteById(trip._id)
          .then(() => {
            Trip
              .findById(trip._id)
              .then((trip) => {
                if (trip) {
                  done(new Error('Trip should have been removed'))
                } else {
                  done()
                }
              })
          })
      })
    })
  })
})
