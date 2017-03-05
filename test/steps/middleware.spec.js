const proxyquire = require('proxyquire').noPreserveCache()
const config = require('config')
const sinon = require('sinon')
const expect = require('chai').expect
const mongoose = require('mongoose')
const Faker = require('faker')
const httpMocks = require('node-mocks-http')
const Step = require(config.get('app-folder') + '/steps/models/step')

let stepMiddlewarePath = config.get('app-folder') + '/steps/middleware'

const findByTripIdStepIdAndImageIdStub = sinon.stub()
const stepMiddleware = require(stepMiddlewarePath)
const stubStepMiddleware = proxyquire(stepMiddlewarePath, {
  './repository': {
    findByTripIdStepIdAndImageId: findByTripIdStepIdAndImageIdStub
  }
})

describe('Step', () => {
  describe('middleware', () => {
    describe(':exists', () => {
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
          let middlewarePromise = stepMiddleware.exists(request, response, next)

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
          let middlewarePromise = stepMiddleware.exists(request, response, next)

          // Then
          middlewarePromise.finally(() => {
            next.should.have.been.called
            done()
          })
        })
      })
    })

    describe(':handleUploadError', () => {
      it('should return INTERNAL_SERVER_ERROR', () => {
        // Given
        let request = httpMocks.createRequest()
        let response = httpMocks.createResponse()
        let next = sinon.spy()
        let err = {
          error: "EACCES: permission denied, open 'uploads/2cb082bca6e6f47b9385e7c1cee755e6'",
          errno: -13,
          code: 'EACCES',
          syscall: 'open',
          path: 'uploads/2cb082bca6e6f47b9385e7c1cee755e6',
          storageErrors: []
        }

        // When
        stepMiddleware.handleUploadError(err, request, response, next)

        next.should.not.have.been.called
        response.statusCode.should.equal(500)
        let data = JSON.parse(response._getData())
        data.should.deep.equal(err)
      })

      it('should call next when there is no err', () => {
        // Given
        let next = sinon.spy()
        let response = httpMocks.createResponse()
        let request = httpMocks.createRequest({})

        let err = null

        // When
        stepMiddleware.handleUploadError(err, request, response, next)

        // Then
        next.should.have.been.called
      })
    })

    describe(':fileExists', () => {
      it('should call next when the image exists', () => {
        // Given
        let response = httpMocks.createResponse()
        let request = httpMocks.createRequest({})
        let nextSpy = sinon.spy()
        findByTripIdStepIdAndImageIdStub.returns(Promise.resolve({}))

        // When
        var promise = stubStepMiddleware.fileExists(request, response, nextSpy)

        // Then
        return promise.then(() => {
          nextSpy.should.have.been.called
        })
      })

      describe('when the resource does not exist', () => {
        it('should not call next', () => {
          // Given
          findByTripIdStepIdAndImageIdStub.returns(Promise.resolve(null))
          let tripid = mongoose.Types.ObjectId().toString()
          let stepid = mongoose.Types.ObjectId().toString()
          let imageSource = mongoose.Types.ObjectId().toString()

          let nextSpy = sinon.spy()
          let response = httpMocks.createResponse()
          let request = httpMocks.createRequest({
            params: { tripid, stepid, imageid: imageSource }
          })

          // When
          var promise = stubStepMiddleware.fileExists(request, response, nextSpy)

          // Then
          return promise.then(() => {
            findByTripIdStepIdAndImageIdStub.should.have.been.calledWith(tripid, stepid, imageSource)
            nextSpy.should.not.have.been.called
          })
        })

        it('should return a 404 error', () => {
          // Given
          findByTripIdStepIdAndImageIdStub.returns(Promise.resolve(null))
          let response = httpMocks.createResponse()
          let request = httpMocks.createRequest({
            params: {
              tripid: mongoose.Types.ObjectId().toString(),
              stepid: mongoose.Types.ObjectId().toString(),
              imageid: mongoose.Types.ObjectId().toString()
            }
          })

          // When
          var promise = stubStepMiddleware.fileExists(request, response, sinon.spy())

          // Then
          return promise.then(() => {
            response.statusCode.should.be.equal(404)
          })
        })
      })
    })
  })
})
