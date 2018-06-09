const Mongoose = require('mongoose')
const Faker = require('faker')
const chai = require('chai')
chai.should()
chai.use(require('sinon-chai'))

const config = require('config')
const Trip = require(config.get('app-folder') + '/trips/model')
const repository = require(config.get('app-folder') + '/trips/repository')
const db = require('../../database')

describe('Integation | Trip | Repository', () => {
  let connexion
  before(() => {
    connexion = db.openDatabaseConnexion()
  })

  after(() => {
    connexion.close()
  })

  afterEach(() => {
    return Trip.remove({})
  })

  describe(':findById', () => {
    let trip
    beforeEach(() => {
      return Trip
        .create({ name: 'My new trip', owner_id: Mongoose.Types.ObjectId() })
        .then((createdTrip) => {
          trip = createdTrip
        })
    })

    it('checks sanity', () => {
      repository.should.have.property('findById')
      repository.findById.should.be.a('function')
    })

    it('should return the right ', () => {
      // When
      return repository.findById(trip._id)
        .then((found, err) => {
          found._id.should.be.deep.equal(trip._id)
          found.name.should.be.equal('My new trip')
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
      let ownerId = Mongoose.Types.ObjectId()

      repository.create({ name, owner_id: ownerId })
        .then((createdTrip) => {
          createdTrip.name.should.be.equal(name)
          createdTrip.owner_id.should.be.equal(ownerId)
          done()
        })
    })

    it('should failed when the model does not respect the validation rules', () => {
      // when
      const promise = repository.create({})

      // then
      return promise.should.have.been.rejectedWith(Mongoose.Error.ValidationError)
    })
  })

  describe(':findByOwnerId', () => {
    let ownerId, anotherOwnerId
    let nameOne, nameTwo, nameThree
    beforeEach(() => {
      nameOne = Faker.lorem.sentence()
      nameTwo = Faker.lorem.sentence()
      nameThree = Faker.lorem.sentence()
      ownerId = Mongoose.Types.ObjectId()
      anotherOwnerId = Mongoose.Types.ObjectId()

      return Trip
        .create([{ name: nameOne, owner_id: ownerId }, { name: nameTwo, owner_id: anotherOwnerId }, { name: nameThree, owner_id: ownerId }])
    })

    it('checks sanity', () => {
      repository.should.have.property('findByOwnerId')
      repository.findByOwnerId.should.be.a('function')
    })

    it('should return one trip', (done) => {
      repository
        .findByOwnerId(ownerId)
        .then((foundTrips) => {
          foundTrips.should.have.length(2)
          foundTrips[0].name.should.equal(nameOne)
          foundTrips[0].owner_id.toString().should.equal(ownerId.toString())
          foundTrips[1].name.should.equal(nameThree)
          foundTrips[1].owner_id.toString().should.equal(ownerId.toString())
          done()
        })
    })
  })

  describe(':updateByIdAndOwnerId', () => {
    let trip, ownerId
    beforeEach(() => {
      ownerId = Mongoose.Types.ObjectId()
      return Trip.create({ name: 'My new trip', owner_id: ownerId })
        .then((createdTrip) => {
          trip = createdTrip
        })
    })

    it('checks sanity', () => {
      repository.should.have.property('updateByIdAndOwnerId')
    })

    it('should partially update the document', () => {
      // when
      const promise = repository
        .updateByIdAndOwnerId(trip._id, ownerId, { name: 'NEW TRIP NAME' })

      // then
      return promise
        .then((data) => {
          return Trip.findById(trip._id)
        })
        .then((trip) => {
          trip.name.should.equal('NEW TRIP NAME')
        })
    })

    it('should return an error when payload is wrong', (done) => {
      repository
        .updateByIdAndOwnerId(trip._id, null, { name: null })
        .then((data) => {
          done(new Error('Should not succeed with a name null'))
        }, () => {
          done()
        })
    })
  })

  describe(':deleteById', () => {
    let trip
    beforeEach(() => {
      return Trip.create({ name: 'My new trip', owner_id: Mongoose.Types.ObjectId() })
        .then((createdTrip) => {
          trip = createdTrip
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
