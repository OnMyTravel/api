const Mongoose = require('mongoose')
const Faker = require('faker')
const chai = require('chai')
chai.should()
chai.use(require('sinon-chai'))
const expect = chai.expect

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
        let location = {
          label: Faker.lorem.sentence(),
          coordinates: {
            latitude: Faker.random.number(),
            longitude: Faker.random.number()
          }
        }

        repository.create({ message, trip_id, location })
          .then((createdTrip) => {
            createdTrip.message.should.be.equal(message)
            createdTrip.trip_id.should.be.equal(trip_id)
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
          .updateByTripIdAndStepId(step._id, { message: 'NEW MESSAGE FOR STEP' })
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
          .updateByTripIdAndStepId(step._id, { trip_id: null })
          .then((data) => {
            done(new Error('Should not succeed with a name null'))
          }, () => {
            done()
          })
      })

      it('should return the updated step', (done) => {
        repository
          .updateByTripIdAndStepId(step._id, { message: 'A SUPER NEW MESSAGE' })
          .then((step, test) => {
            step.message.should.equal('A SUPER NEW MESSAGE')
            done()
          }, () => {
            done(new Error('Should not end in error'))
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

    describe(':addImageToGallery', () => {
      let step, tripId
      beforeEach((done) => {
        tripId = Mongoose.Types.ObjectId()
        Step
          .create({ message: 'My new trip', trip_id: tripId })
          .then((createdStep) => {
            step = createdStep
            done()
          })
      })

      it('checks sanity', () => {
        repository.should.have.property('addImageToGallery')
      })

      it('should append an image to step model', (done) => {
        repository
          .addImageToGallery(step._id, { caption: 'An adorable kitten image', size: 9646, source: 'uploads/imagename' })
          .then(() => {
            Step
              .findById(step._id)
              .then((step) => {
                step.gallery.should.have.length(1)
                done()
              })
          })
      })

      it('should raise an error when the requirements are not fullfilled', (done) => {
        repository
          .addImageToGallery(step._id, { caption: 'An adorable kitten image', size: 9646 })
          .then(() => {
            done(new Error('should not be considered as valid'))
          }, (err) => {
            err.should.be.defined
            done()
          })
      })

      it('should save GPS informations', () => {
        var expectedGPSInformations = {
          GPSLatitudeRef: 'N',
          GPSLatitude: [48, 51, 20.36],
          GPSLongitudeRef: 'E',
          GPSLongitude: [2, 16, 12.6],
          GPSAltitudeRef: 0,
          GPSAltitude: 42.93607305936073
        }

        var promise = repository
          .addImageToGallery(step._id, {
            source: 'uploads/imagename',
            caption: 'An adorable kitten image',
            size: 9646,
            gps: expectedGPSInformations
          })

        return promise.then(() => {
          return Step
            .findById(step._id)
            .then((step) => {
              step.gallery.should.have.length(1)
              var imageGPSDetails = step.gallery[0].gps.toJSON()

              delete imageGPSDetails._id
              imageGPSDetails.should.deep.eql(expectedGPSInformations)
            })
        })
      })
    })

    describe(':findByTripIdStepIdAndImageId', () => {
      let tripId, imageId, createdStep

      before((done) => {
        tripId = Mongoose.Types.ObjectId()
        imageId = Mongoose.Types.ObjectId()

        Step
          .create({ trip_id: tripId, message: Faker.lorem.sentence(), gallery: [{ _id: imageId, source: 'path/to/file.png' }] })
          .then((step) => {
            createdStep = step
            done()
          })
      })

      it('checks sanity', () => {
        repository.should.have.property('findByTripIdStepIdAndImageId')
        repository.findByTripIdStepIdAndImageId.should.be.a('function')
      })

      it('should find step according to the parameters', () => {
        var prom = repository
          .findByTripIdStepIdAndImageId(tripId, createdStep._id, 'path/to/file.png')

        return prom.then((step) => {
          step.should.be.defined
          step._id.toString().should.be.equal(createdStep._id.toString())
        })
      })

      it('when trip does not exist', () => {
        var prom = repository
          .findByTripIdStepIdAndImageId(Mongoose.Types.ObjectId(), createdStep._id, 'path/to/file.png')

        return prom.then((step) => {
          expect(step).to.be.null
        })
      })

      it('when the step does not exist', () => {
        var prom = repository
          .findByTripIdStepIdAndImageId(tripId, Mongoose.Types.ObjectId(), 'path/to/file.png')

        return prom.then((step) => {
          expect(step).to.be.null
        })
      })

      it('when the source does not exist', () => {
        var prom = repository
          .findByTripIdStepIdAndImageId(tripId, createdStep._id, 'sourcename.does.not.exist')

        return prom.then((step) => {
          expect(step).to.be.null
        })
      })
    })
  })
})
