const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);

const Faker = require('faker')
const mongoose = require('mongoose')
const httpMocks = require('node-mocks-http')

const db = require('../../database')
const Step = require('../../app/steps/models/step')

const stepMiddleware = require('../../app/steps/middleware')
const repository = require('../../app/steps/repository')

describe('Unit | Step | Middleware', () => {

  let sandbox;
  let connexion;

  before(() => {
    connexion = db.openDatabaseConnexion();
  })

  after(() => {
    connexion.close()
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(repository, 'findByTripIdAndStepId').resolves()
    sandbox.stub(repository, 'findByTripIdStepIdAndImageId').resolves();
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe(':exists', () => {

    describe('when the steps does not exist', () => {
      it('should return NOT_FOUND', () => {
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
        return middlewarePromise.then(() => {
          next.should.not.have.been.called
          response.statusCode.should.be.equal(404)
        })
      })
    })

    describe('when the steps exists', () => {

      let step, trip_id
      beforeEach(() => {
        trip_id = mongoose.Types.ObjectId()
        return Step
          .create({ trip_id, message: Faker.lorem.sentence() })
          .then((createdStep) => {
            step = createdStep
          })
          .catch((e) => {
            console.log('ER', e)
          })
      })

      it('should call next', () => {
        // Given
        repository.findByTripIdAndStepId.resolves(step)
        var next = sinon.spy()
        let response = httpMocks.createResponse()
        let request = httpMocks.createRequest({
          url: '',
          params: {
            tripid: trip_id.toString(),
            stepid: step._id.toString()
          }
        })

        // When
        let middlewarePromise = stepMiddleware.exists(request, response, next)

        // Then
        return middlewarePromise.then(() => {
          next.should.have.been.called
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
      repository.findByTripIdStepIdAndImageId.resolves({})
      let response = httpMocks.createResponse()
      let request = httpMocks.createRequest({})
      let nextSpy = sinon.spy()

      // When
      const promise = stepMiddleware.fileExists(request, response, nextSpy)

      // Then
      return promise.then(() => {
        nextSpy.should.have.been.called
      })
    })

    describe('when the resource does not exist', () => {
      it('should not call next', () => {
        // Given
        let tripid = mongoose.Types.ObjectId().toString()
        let stepid = mongoose.Types.ObjectId().toString()
        let imageSource = mongoose.Types.ObjectId().toString()

        let nextSpy = sinon.spy()
        let response = httpMocks.createResponse()
        let request = httpMocks.createRequest({
          params: { tripid, stepid, imageid: imageSource }
        })

        // When
        const promise = stepMiddleware.fileExists(request, response, nextSpy)

        // Then
        return promise.then(() => {
          repository.findByTripIdStepIdAndImageId.should.have.been.calledWith(tripid, stepid, imageSource)
          nextSpy.should.not.have.been.called
        })
      })

      it('should return a 404 error', () => {
        // Given
        let response = httpMocks.createResponse()
        let request = httpMocks.createRequest({
          params: {
            tripid: mongoose.Types.ObjectId().toString(),
            stepid: mongoose.Types.ObjectId().toString(),
            imageid: mongoose.Types.ObjectId().toString()
          }
        })

        // When
        const promise = stepMiddleware.fileExists(request, response, sinon.spy())

        // Then
        return promise.then(() => {
          response.statusCode.should.be.equal(404)
        })
      })
    })
  })
})
