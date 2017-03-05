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

let downloadStub = sinon.stub()
let fsUnlinkSyncStub = sinon.stub()
let addImageToGalleryStub = sinon.stub().returns(new Promise(function (resolve, reject) { resolve(STEP_SAVED_IN_DB) }))
let mocks = {
  '../shared': {
    images: {
      getCoordinates: getCoordinatesStub
    },
    containers: {
      uploadToStorage: uploadToStorageStub,
      download: downloadStub
    }
  },
  fs: {
    unlinkSync: fsUnlinkSyncStub
  },
  './repository': {
    addImageToGallery: addImageToGalleryStub
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
              mime: 'image/jpeg',
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
  })
})
