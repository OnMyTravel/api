const config    = require('config')
const sinon     = require('sinon')
const mongoose  = require('mongoose')
const Faker     = require('faker')
const httpMocks = require('node-mocks-http')
const Step      = require(config.get('app-folder') + '/steps/models/step')

const tripMiddleware = require(config.get('app-folder') + '/steps/middleware')

describe('Step', () => {
  describe('middleware', () => {
    describe('exists', () => {
      describe('when the steps does not exist', () => {
        it('should return NOT_FOUND', (done) => {
          // Given
          var next = sinon.spy()
          let response = httpMocks.createResponse()
          let request = httpMocks.createRequest({
            url: '',
            params: {
              tripid: mongoose.Types.ObjectId().toString(),
              stepid: mongoose.Types.ObjectId().toString()
            }
          })

          // When
          let middlewarePromise = tripMiddleware.exists(request, response, next)

          // Then
          middlewarePromise.finally(() => {
            next.should.not.have.been.called
            response.statusCode.should.be.equal(404)
            done()
          })
        })
      })

      describe('when the steps exists', () => {
        let step_id, trip_id
        before((done) => {
          trip_id = mongoose.Types.ObjectId()
          Step
            .create({ trip_id, message: Faker.lorem.sentence() })
            .then((step) => {
              step_id = step._id
              done()
            })
        })

        it('should call next', (done) => {
          // Given
          var next = sinon.spy()
          let response = httpMocks.createResponse()
          let request = httpMocks.createRequest({
            url: '',
            params: {
              tripid: trip_id.toString(),
              stepid: step_id.toString()
            }
          })

          // When
          let middlewarePromise = tripMiddleware.exists(request, response, next)

          // Then
          middlewarePromise.finally(() => {
            next.should.have.been.called
            done()
          })
        })
      })
    })
  })
})
