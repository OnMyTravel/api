const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.should()
chai.use(sinonChai)

const httpMocks = require('node-mocks-http')
const fs = require('fs')
const winston = require('winston')
const shared = require('../../app/shared')
const GPSError = shared.errors.classes.GPSError
const ContainerError = shared.errors.classes.ContainerError

const STEP_SAVED_IN_DB = {
  message: 'Lorem ipsum sin dolor sit amet',
  gallery: {
    source: 'file.jpg',
    caption: 'Subtitle'
  }
}
const COORDINATES = {
  GPSLatitudeRef: 'E',
  GPSLatitude: [51, 27, 1],
  GPSLongitudeRef: 'N',
  GPSLongitude: [72, 16, 42],
  GPSAltitudeRef: 'Z',
  GPSAltitude: 715.4
}

const repository = require('../../app/steps/repository')
const StepController = require('../../app/steps/controller')

describe('Unit | Steps | Controller', () => {
  describe(':attach', () => {
    const sandbox = sinon.createSandbox()

    beforeEach(() => {
      sandbox.stub(shared.images, 'getCoordinates')
      shared.images.getCoordinates.withArgs('path/to/myfile.jpg').resolves(COORDINATES)
      shared.images.getCoordinates.withArgs('path/to/errored/file.jpg').rejects(new GPSError('Error message'))

      sandbox.stub(shared.containers, 'uploadToStorage').resolves()
      sandbox.stub(fs, 'unlinkSync')
      sandbox.stub(repository, 'addImageToGallery').resolves(STEP_SAVED_IN_DB)
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('checks sanity', () => {
      StepController.should.have.property('attach')
    })

    it('should return BAD_REQUEST if there are no file attached', () => {
      // Given
      let response = httpMocks.createResponse()
      let request = httpMocks.createRequest({
        method: 'POST',
        url: ''
      })

      // When
      StepController.attach(request, response)

      // Then
      response.getHeader('Content-Type').should.equal('application/json')
      response.statusCode.should.equal(400)
    })

    describe('when a file is uploaded', () => {
      let response, request

      beforeEach(() => {
        response = httpMocks.createResponse()
        request = httpMocks.createRequest({
          method: 'POST',
          url: '',
          file: {
            filename: 'myfile.jpg',
            path: 'path/to/myfile.jpg',
            mimetype: 'image/jpeg',
            size: '7246.4'
          },
          params: {
            tripid: 'GOOD_ID',
            stepid: 'GOOD_STEP_ID'
          },
          body: {
            caption: 'My caption'
          }
        })
      })

      it('should extract coordinates from file', () => {
        // When
        StepController.attach(request, response)

        // Then
        response.statusCode.should.equal(200)
        shared.images.getCoordinates.should.have.been.calledWith('path/to/myfile.jpg')
      })

      describe('when an error occurs while extracting coordinates', () => {
        it('should return a Unprocessable Entity', () => {
          // Given
          request.file.path = 'path/to/errored/file.jpg'

          // When
          let t = StepController.attach(request, response)

          // Then
          return t.then(() => {
            response.statusCode.should.equal(422)
            shared.images.getCoordinates.should.have.been.calledWith('path/to/errored/file.jpg')
          })
        })
      })

      it('should remove the saved file', () => {
        // When
        let t = StepController.attach(request, response)

        // Then
        return t.then(() => {
          fs.unlinkSync.should.have.been.calledWith('path/to/myfile.jpg')
          response.statusCode.should.equal(201)
        })
      })

      it('should upload the image', () => {
        // When
        let promise = StepController.attach(request, response)

        // Then
        return promise.then(() => {
          response.statusCode.should.equal(201)
          shared.containers.uploadToStorage.should.have.been.calledWith({
            path: 'path/to/myfile.jpg',
            name: 'myfile.jpg',
            mime: 'image/jpeg'
          }, 'GOOD_ID')
        })
      })

      it('should save the image in database', () => {
        // When
        let promise = StepController.attach(request, response)

        // Then
        return promise.then(() => {
          repository.addImageToGallery.should.have.been.calledWith('GOOD_STEP_ID', {
            caption: 'My caption',
            source: 'myfile.jpg',
            size: '7246.4',
            gps: COORDINATES
          })
          response.statusCode.should.equal(201)
        })
      })

      it('return database informations', () => {
        // When
        let t = StepController.attach(request, response)

        // Then
        return t.then((e) => {
          response.statusCode.should.equal(201)
          var data = JSON.parse(response._getData())
          data.should.be.deep.equal(STEP_SAVED_IN_DB)
        })
      })

      describe('when the upload fails', () => {
        it('should return INTERNAL ERROR', () => {
          // Given
          shared.containers.uploadToStorage.rejects(new ContainerError('Unable to upload the file'))
          request.params.tripid = 'ERRORED_ID'

          // When
          let promise = StepController.attach(request, response)

          // Then
          return promise.then(() => {
            response.statusCode.should.equal(500)
          })
        })
      })
    })
  })

  describe(':getImage', () => {
    beforeEach(() => {
      sinon.stub(shared.containers, 'download')
    })

    afterEach(() => {
      shared.containers.download.restore()
    })

    it('checks sanity', () => {
      StepController.should.have.property('getImage')
    })

    it('should call destroy function from container', () => {
      // Given
      let response = httpMocks.createResponse()
      let request = httpMocks.createRequest({
        method: 'GET',
        url: '',
        params: {
          tripid: 'GOOD_ID',
          stepid: 'GOOD_STEP_ID',
          imageid: 'GOOD_IMAGE_ID'
        },
        body: {
          caption: 'My caption'
        }
      })

      // When
      StepController.getImage(request, response)

      // Then
      shared.containers.download.should.have.been.calledWith('GOOD_ID', 'GOOD_IMAGE_ID', response)
    })
  })

  describe(':deleteOne', () => {
    let response, request

    const sandbox = sinon.createSandbox()

    beforeEach(() => {
      response = httpMocks.createResponse()
      request = httpMocks.createRequest({
        method: 'DELETE',
        url: '',
        params: {
          tripid: 'GOOD_ID',
          stepid: 'GOOD_STEP_ID'
        }
      })

      const step = {
        gallery: [{
          source: 'filenumberone',
          caption: 'My super photo',
          size: 34567
        }, {
          source: 'filenumbertwo',
          caption: 'My super photo',
          size: 34567
        }]
      }

      sandbox.stub(repository, 'findByTripIdAndStepId').resolves(step)
      sandbox.stub(repository, 'deleteById').resolves()
      sandbox.stub(shared.containers, 'deleteFile').resolves()
      sandbox.stub(winston, 'error')
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('should remove file from container', () => {
      // When
      let promise = StepController.deleteOne(request, response)

      // Then
      return promise.then(() => {
        repository.findByTripIdAndStepId.should.have.been.calledWith('GOOD_ID', 'GOOD_STEP_ID')
        shared.containers.deleteFile.should.have.been.calledWith('GOOD_ID', 'filenumberone')
      })
    })

    it('should remove every file from container', () => {
      // When
      let promise = StepController.deleteOne(request, response)

      // Then
      return promise.then(() => {
        shared.containers.deleteFile.should.have.been.calledWith('GOOD_ID', 'filenumberone')
        shared.containers.deleteFile.should.have.been.calledWith('GOOD_ID', 'filenumbertwo')
      })
    })

    it('should remove step from database', () => {
      // When
      let promise = StepController.deleteOne(request, response)

      // Then
      return promise.then(() => {
        repository.deleteById.should.have.been.calledWith('GOOD_STEP_ID')
      })
    })

    it('should send JSON result', () => {
      // When
      let promise = StepController.deleteOne(request, response)

      // Then
      return promise.then(() => {
        response.statusCode.should.equal(200)
        response.getHeader('Content-Type').should.equal('application/json')
      })
    })

    it('should not delete anything if there is no step found', () => {
      // Given
      repository.findByTripIdAndStepId.resolves()

      // When
      let promise = StepController.deleteOne(request, response)

      // Then
      return promise.then(() => {
        repository.deleteById.should.not.have.been.called
      })
    })

    it('should return NOT_FOUND when not step found', () => {
      // Given
      repository.findByTripIdAndStepId.resolves()

      // When
      let promise = StepController.deleteOne(request, response)

      // Then
      return promise.then(() => {
        response.statusCode.should.equal(404)
        response.getHeader('Content-Type').should.equal('application/json')
      })
    })

    it('should log the deletion fail when it occurs', () => {
      // Given
      shared.containers.deleteFile.onCall(0).returns(Promise.reject(new Error('BUI')))
      shared.containers.deleteFile.onCall(1).returns(Promise.reject(new Error('FGD')))

      // When
      let promise = StepController.deleteOne(request, response)

      // Then
      return promise.then(() => {
        winston.error.should.have.been.called
      })
    })
  })
})
