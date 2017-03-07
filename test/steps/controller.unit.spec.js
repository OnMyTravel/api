require('chai').should()

const sinon = require('sinon')
const config = require('config')
const httpMocks = require('node-mocks-http')
const proxyquire = require('proxyquire').noPreserveCache()
const shared = require(require('config').get('app-folder') + '/shared')
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
  GPSLatitude: [ 51, 27, 1 ],
  GPSLongitudeRef: 'N',
  GPSLongitude: [ 72, 16, 42 ],
  GPSAltitudeRef: 'Z',
  GPSAltitude: 715.4
}

const GET_COORDINATES_SUCCESS = new Promise((resolve, reject) => { resolve(COORDINATES) })
const GET_COORDINATES_ERROR = new Promise((resolve, reject) => { reject(new GPSError('Error message')) })

let getCoordinatesStub = sinon.stub()
getCoordinatesStub.withArgs('path/to/myfile.jpg').returns(GET_COORDINATES_SUCCESS)
getCoordinatesStub.withArgs('path/to/errored/file.jpg').returns(GET_COORDINATES_ERROR)

let uploadToStorageStub = sinon.stub()
uploadToStorageStub.withArgs(sinon.match.any, 'GOOD_ID')
  .returns(new Promise((resolve, reject) => { resolve() }))
uploadToStorageStub.withArgs(sinon.match.any, 'ERRORED_ID')
  .returns(new Promise((resolve, reject) => { reject(new ContainerError('Unable to upload the file')) }))

let findByTripIdAndStepIdStub = sinon.stub()
let deleteByIdStub = sinon.stub().returns(Promise.resolve())
let downloadStub = sinon.stub()
let deleteFileStub = sinon.stub()
let fsUnlinkSyncStub = sinon.stub()
let addImageToGalleryStub = sinon.stub().returns(Promise.resolve(STEP_SAVED_IN_DB))
let winstonErrorStub = sinon.stub()
let mocks = {
  '../shared': {
    images: {
      getCoordinates: getCoordinatesStub
    },
    containers: {
      uploadToStorage: uploadToStorageStub,
      download: downloadStub,
      deleteFile: deleteFileStub
    }
  },
  fs: {
    unlinkSync: fsUnlinkSyncStub
  },
  './repository': {
    addImageToGallery: addImageToGalleryStub,
    deleteById: deleteByIdStub,
    findByTripIdAndStepId: findByTripIdAndStepIdStub
  },
  'winston': {
    error: winstonErrorStub
  }
}
const StepController = proxyquire(config.get('app-folder') + '/steps/controller', mocks)

describe('Steps', () => {
  describe('controller', () => {
    describe(':attach', () => {
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
          getCoordinatesStub.should.have.been.calledWith('path/to/myfile.jpg')
        })

        describe('when an error occurs while extracting coordinates', () => {
          it('should return a Unprocessable Entity', () => {
            // Given
            request.file.path = 'path/to/errored/file.jpg'

            // When
            let t = StepController.attach(request, response)

            // Then
            return t.then((e) => {
              response.statusCode.should.equal(422)
              getCoordinatesStub.should.have.been.calledWith('path/to/errored/file.jpg')
            })
          })
        })

        it('should remove the saved file', () => {
          // When
          let t = StepController.attach(request, response)

          // Then
          return t.then(() => {
            fsUnlinkSyncStub.should.have.been.calledWith('path/to/myfile.jpg')
            response.statusCode.should.equal(201)
          })
        })

        it('should upload the image', () => {
          // When
          let t = StepController.attach(request, response)

          // Then
          return t.then((e) => {
            response.statusCode.should.equal(201)
            uploadToStorageStub.should.have.been.calledWith({
              path: 'path/to/myfile.jpg',
              name: 'myfile.jpg',
              mime: 'image/jpeg'
            }, 'GOOD_ID')
          })
        })

        it('should save the image in database', () => {
          // When
          let t = StepController.attach(request, response)

          // Then
          return t.then((e) => {
            addImageToGalleryStub.should.have.been.calledWith('GOOD_STEP_ID', {
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
            request.params.tripid = 'ERRORED_ID'

            // When
            let t = StepController.attach(request, response)

            // Then
            return t.then((e) => {
              response.statusCode.should.equal(500)
            })
          })
        })
      })
    })

    describe(':getImage', () => {
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
        downloadStub.should.have.been.calledWith('GOOD_ID', 'GOOD_IMAGE_ID', response)
      })
    })

    describe(':deleteOne', () => {
      let response, request
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

        findByTripIdAndStepIdStub.returns(Promise.resolve({
          gallery: [{
            source: 'filenumberone',
            caption: 'My super photo',
            size: 34567
          }, {
            source: 'filenumbertwo',
            caption: 'My super photo',
            size: 34567
          }]
        }))

        deleteByIdStub.reset()
        deleteFileStub.reset()
      })

      it('checks sanity', () => {
        StepController.deleteOne.should.be.defined
      })

      it('should remove step from database', () => {
        // When
        let promise = StepController.deleteOne(request, response)

        // Then
        return promise.then(() => {
          deleteByIdStub.should.have.been.calledWith('GOOD_STEP_ID')
        })
      })

      it('should remove file from container', () => {
        // When
        let promise = StepController.deleteOne(request, response)

        // Then
        return promise.then(() => {
          findByTripIdAndStepIdStub.should.have.been.calledWith('GOOD_ID', 'GOOD_STEP_ID')
          deleteFileStub.should.have.been.calledWith('GOOD_ID', 'filenumberone')
        })
      })

      it('should remove every file from container', () => {
        // When
        let promise = StepController.deleteOne(request, response)

        // Then
        return promise.then(() => {
          findByTripIdAndStepIdStub.should.have.been.calledWith('GOOD_ID', 'GOOD_STEP_ID')
          deleteFileStub.should.have.been.calledWith('GOOD_ID', 'filenumberone')
          deleteFileStub.should.have.been.calledWith('GOOD_ID', 'filenumbertwo')
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
        findByTripIdAndStepIdStub.returns(Promise.resolve())

        // When
        let promise = StepController.deleteOne(request, response)

        // Then
        return promise.then(() => {
          deleteByIdStub.should.not.have.been.called
        })
      })

      it('should return NOT_FOUND when not step found', () => {
        // Given
        findByTripIdAndStepIdStub.returns(Promise.resolve())

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
        deleteFileStub.onCall(0).returns(Promise.reject(new Error('BUI')))
        deleteFileStub.onCall(1).returns(Promise.reject(new Error('FGD')))

        // When
        let promise = StepController.deleteOne(request, response)

        // Then
        return promise.then(() => {
          winstonErrorStub.should.have.been.called
        })
      })
    })
  })
})
