const shared = require('../../app/shared')
const proxyquire = require('proxyquire').noPreserveCache()
const httpMocks = require('node-mocks-http')

const StreamTest = require('streamtest')['v2']
const faker = require('faker')
const chai = require('chai')
const sinon = require('sinon')
chai.should()

let createContainerStub = sinon.stub()
createContainerStub.withArgs({ name: 'tripOnSuccess' }).callsArgWith(1, null, { message: 'SUCCESS' })
createContainerStub.withArgs({ name: 'tripOnError' }).callsArgWith(1, { message: 'FAILURE' }, null)

const storageConfig = {
  'provider': 'openstack',
  'username': 'd5GAz50NhkJa',
  'password': 'd5GAz50NhkJad5GAz50NhkJad5GAz50NhkJa',
  'authUrl': 'https://auth.provider.io/',
  'tenantId': '6a78f42725673f4s725GaC6S3d5c7620',
  'region': 'REG1'
}

let uploadStub = sinon.stub()
let downloadStub = sinon.stub()
let removeFileStub = sinon.stub()
const createClientStub = sinon.stub()
createClientStub.returns({
  createContainer: createContainerStub,
  upload: uploadStub,
  download: downloadStub,
  removeFile: removeFileStub
})

var pkgcloudStub = {
  storage: {
    createClient: createClientStub
  }
}

const FILE_THAT_DOES_NOT_EXIST = 'foo.jpg'
const FILE_THAT_EXISTS = 'bar/baz.jpg'

let configGetStub = sinon.stub().withArgs('storage').returns(storageConfig)
let createReadStreamStub = sinon.stub()

const containers = proxyquire('../../app/shared/containers', {
  'pkgcloud': pkgcloudStub,
  'config': {
    get: configGetStub
  },
  'fs': {
    'createReadStream': createReadStreamStub
  }
})

describe('Shared', () => {
  describe('containers', () => {
    it('checks sanity', () => {
      shared.containers.should.be.defined
    })

    describe(':create', () => {
      it('checks sanity', () => {
        shared.containers.create.should.be.defined
      })

      it('should use configuration', () => {
        // Given
        let tripId = '1234567890'

        // When
        containers.create(tripId)

        // Then
        createClientStub.should.have.been.calledWith(storageConfig)
      })

      it('should use create a container', () => {
        // Given
        let tripId = '1234567890'

        // When
        containers.create(tripId)

        // Then
        createContainerStub.should.have.been.calledWith({ name: tripId })
      })

      it('should return a resolved promise with the container', (done) => {
        // Given
        let tripId = 'tripOnSuccess'

        // When
        containers
          .create(tripId)
          .then((container) => {
            container.should.deep.equal({ message: 'SUCCESS' })
            done()
          }, () => {
            done(new Error('Should not be on error'))
          })

        // Then
        createContainerStub.should.have.been.calledWith({ name: tripId })
      })

      it('should return a rejected promise with the error', () => {
        // Given
        let tripId = 'tripOnError'

        // When
        let promise = containers
          .create(tripId)

        return promise.then((container) => {
          container.should.be.undefined
        }, (error) => {
          error.should.be.an.instanceof(shared.errors.classes.ContainerError)
          error.message.should.deep.equal('FAILURE')
          createContainerStub.should.have.been.calledWith({ name: tripId })
        })
      })
    })

    describe(':uploadToStorage', () => {
      let TRIP_ID, FILE_INFOS, WRITE_STREAM_RESULT
      before(() => {
        WRITE_STREAM_RESULT = { state: 'success' }
        TRIP_ID = faker.random.uuid()
        FILE_INFOS = {
          name: faker.system.fileName(),
          mime: faker.system.mimeType(),
          path: FILE_THAT_EXISTS
        }
      })

      let erroredReadableStream, readableStream, writableStream
      beforeEach(() => {
        writableStream = StreamTest.toChunks(() => {})
        readableStream = StreamTest.fromChunks([new Buffer('file')])
        erroredReadableStream = StreamTest.fromErroredChunks(
          new Error('ENOENT: no such file or directory, open \'foo.jpg\''),
          [new Buffer('file')]
        )

        uploadStub.returns(writableStream)

        createReadStreamStub
          .withArgs(FILE_THAT_DOES_NOT_EXIST)
          .returns(erroredReadableStream)

        createReadStreamStub
          .withArgs(FILE_THAT_EXISTS)
          .returns(readableStream)
      })

      it('checks sanity', () => {
        shared.containers.uploadToStorage.should.be.defined
      })

      it('should return a resolved promise if the file does not exist', () => {
        // When
        let promise = containers.uploadToStorage({ path: FILE_THAT_DOES_NOT_EXIST })

        // Then
        return promise.then(
            (file) => { file.should.be.undefined() },
            (err) => {
              err.should.be.an.instanceof(shared.errors.classes.ContainerError)
              err.message.should.be.equal("ENOENT: no such file or directory, open 'foo.jpg'")
            }
          )
      })

      it('should create a storage client', () => {
        // Given
        let prom = containers.uploadToStorage({ path: FILE_THAT_EXISTS })

        // When
        writableStream.emit('success', {})

        // Then
        return prom.then(() => {
          createClientStub.should.have.been.called
          createClientStub.should.have.been.calledWith(storageConfig)
        })
      })

      it('should call the upload() function with the correct configuration', () => {
        // Given
        let prom = containers.uploadToStorage(FILE_INFOS, TRIP_ID)

        // When
        writableStream.emit('success', {})

        // Then
        return prom.then(() => {
          uploadStub.should.have.been.calledWith({
            container: TRIP_ID,
            remote: FILE_INFOS.name,
            contentType: FILE_INFOS.mime
          })
        })
      })

      describe('when the writable stream is on error', () => {
        it('should reject promise with the error message', () => {
          // Given
          let prom = containers.uploadToStorage(FILE_INFOS, TRIP_ID)
          let writableStreamError = new Error('Unable to write the document on the output stream')

          // When
          writableStream.emit('error', writableStreamError)

          return prom.then((file) => {
            file.should.be.undefined()
          }, (err) => {
            err.should.be.an.instanceof(shared.errors.classes.ContainerError)
            err.message.should.be.equal('Unable to write the document on the output stream')
          })
        })
      })

      describe('when the writable stream is a success', () => {
        it('should resolve the promise with data from writable stream', () => {
          // Given
          let prom = containers.uploadToStorage(FILE_INFOS, TRIP_ID)

          // When
          writableStream.emit('success', WRITE_STREAM_RESULT)

          // Then
          return prom.then((file) => {
            file.should.be.deep.equal(WRITE_STREAM_RESULT)
          }, (err) => {
            err.should.be.undefined()
          })
        })
      })
    })

    describe(':download', () => {
      it('checks sanity', () => {
        shared.containers.download.should.be.defined
      })

      it('should create a storageClient', () => {
        // When
        containers.download()

        // Then
        createClientStub.should.have.been.calledWith(storageConfig)
      })

      it('should call download', () => {
        // Given
        let tripId = 'TRIPID'
        let filename = 'FILENAME'
        let response = httpMocks.createResponse()

        // When
        containers.download(tripId, filename, response)

        // Then
        downloadStub.should.have.been.calledWith({
          container: tripId,
          remote: filename,
          stream: response
        })
      })
    })

    describe(':deleteFile', () => {
      it('checks sanity', () => {
        containers.deleteFile.should.be.defined
      })

      it('should call create client with config', () => {
        // Given
        removeFileStub.callsArgWith(2, null, {})

        // When
        let promise = containers.deleteFile()

        // Then
        return promise.then(() => {
          createClientStub.should.have.been.calledWith(storageConfig)
        })
      })

      it('should return a rejected promise when something turns sour', () => {
        // Given
        removeFileStub.callsArgWith(2, new Error('Unable to remove that document'), null)

        // When
        let promise = containers.deleteFile()

        // Then
        return promise.then(() => {
          throw new Error('Should not succeed')
        }, (error) => {
          error.should.be.an.instanceof(shared.errors.classes.ContainerError)
          error.message.should.equal('Unable to remove that document')
        })
      })

      it('should call removeFile with arguments', () => {
        // Given
        removeFileStub.callsArgWith(2, null, {})
        let tripId = 'TRIP_ID'
        let imageId = 'IMAGE_ID'

        // When
        let promise = containers.deleteFile(tripId, imageId)

        // Then
        return promise.then(() => {
          removeFileStub.should.have.been.calledWith(tripId, imageId)
        })
      })
    })
  })
})
