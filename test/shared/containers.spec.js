const shared = require('../../app/shared')
const httpMocks = require('node-mocks-http')

const StreamTest = require('streamtest')['v2']
const faker = require('faker')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.should()
chai.use(sinonChai)

const storageConfig = {
  'provider': 'openstack',
  'username': 'd5GAz50NhkJa',
  'password': 'd5GAz50NhkJad5GAz50NhkJad5GAz50NhkJa',
  'authUrl': 'https://auth.provider.io/',
  'tenantId': '6a78f42725673f4s725GaC6S3d5c7620',
  'region': 'REG1'
}

const FILE_THAT_DOES_NOT_EXIST = 'foo.jpg'
const FILE_THAT_EXISTS = 'bar/baz.jpg'

const pkgcloud = require('pkgcloud')
const config = require('config')

let createReadStreamStub = sinon.stub()

const containers = require('../../app/shared/containers')

describe('Unit | Shared', () => {
  describe('containers', () => {
    const sandbox = sinon.createSandbox()
    let createClientStub

    beforeEach(() => {
      createClientStub = {
        createContainer: sinon.stub(),
        upload: sinon.stub(),
        download: sinon.stub(),
        removeFile: sinon.stub(),
        destroyContainer: sinon.stub()
      }

      sandbox
        .stub(pkgcloud.storage, 'createClient')
        .returns(createClientStub)

      sandbox.stub(config, 'get').withArgs('storage').returns(storageConfig)
    })

    afterEach(() => (
      sandbox.restore()
    ))

    it('checks sanity', () => {
      shared.containers.should.exist
    })

    describe(':create', () => {
      it('checks sanity', () => {
        shared.containers.create.should.exist
      })

      it('should use configuration', () => {
        // Given
        let tripId = '1234567890'

        // When
        containers.create(tripId)

        // Then
        pkgcloud.storage.createClient.should.have.been.calledWith(storageConfig)
      })

      it('should use create a container', () => {
        // Given
        let tripId = '1234567890'

        // When
        containers.create(tripId)

        // Then
        createClientStub.createContainer.should.have.been.calledWith({ name: tripId })
      })

      it('should return a resolved promise with the container', () => {
        // Given
        const containerDetails = { id: 'container-on-success' }
        createClientStub.createContainer.yields(null, containerDetails)
        let tripId = 'tripOnSuccess'

        // When
        const promise = containers
          .create(tripId)

        // Then
        return promise.then((container) => {
          container.should.deep.equal(containerDetails)
          createClientStub.createContainer.should.have.been.calledWith({ name: tripId })
        }, () => {
          throw new Error('Should not be on error')
        })
      })

      it('should return a rejected promise with the error', () => {
        // Given
        const error = new Error('container-creation-on-failure')
        createClientStub.createContainer.yields(error, null)
        let tripId = 'tripOnError'

        // When
        let promise = containers
          .create(tripId)

        return promise.then((container) => {
          container.should.be.undefined
        }, (error) => {
          error.should.be.an.instanceof(shared.errors.classes.ContainerError)
          error.message.should.deep.equal('container-creation-on-failure')
          createClientStub.createContainer.should.have.been.calledWith({ name: tripId })
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
        writableStream = StreamTest.toChunks(() => { })
        readableStream = StreamTest.fromChunks([Buffer.from('file')])
        erroredReadableStream = StreamTest.fromErroredChunks(
          new Error('ENOENT: no such file or directory, open \'foo.jpg\''),
          [Buffer.from('file')]
        )

        createClientStub.upload.returns(writableStream)

        createReadStreamStub
          .withArgs(FILE_THAT_DOES_NOT_EXIST)
          .returns(erroredReadableStream)

        createReadStreamStub
          .withArgs(FILE_THAT_EXISTS)
          .returns(readableStream)
      })

      it('checks sanity', () => {
        shared.containers.uploadToStorage.should.exist
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
          pkgcloud.storage.createClient.should.have.been.called
          pkgcloud.storage.createClient.should.have.been.calledWith(storageConfig)
        })
      })

      it('should call the upload() function with the correct configuration', () => {
        // Given
        let prom = containers.uploadToStorage(FILE_INFOS, TRIP_ID)

        // When
        writableStream.emit('success', {})

        // Then
        return prom.then(() => {
          createClientStub.upload.should.have.been.calledWith({
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
        shared.containers.download.should.exist
      })

      it('should create a storageClient', () => {
        // When
        containers.download()

        // Then
        pkgcloud.storage.createClient.should.have.been.calledWith(storageConfig)
      })

      it('should call download', () => {
        // Given
        let tripId = 'TRIPID'
        let filename = 'FILENAME'
        let response = httpMocks.createResponse()

        // When
        containers.download(tripId, filename, response)

        // Then
        createClientStub.download.should.have.been.calledWith({
          container: tripId,
          remote: filename,
          stream: response
        })
      })
    })

    describe(':deleteFile', () => {
      it('checks sanity', () => {
        containers.deleteFile.should.exist
      })

      it('should call create client with config', () => {
        // Given
        createClientStub.removeFile.callsArgWith(2, null, {})

        // When
        let promise = containers.deleteFile()

        // Then
        return promise.then(() => {
          pkgcloud.storage.createClient.should.have.been.calledWith(storageConfig)
        })
      })

      it('should return a rejected promise when something turns sour', () => {
        // Given
        createClientStub.removeFile.callsArgWith(2, new Error('Unable to remove that document'), null)

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
        createClientStub.removeFile.callsArgWith(2, null, {})
        let tripId = 'TRIP_ID'
        let imageId = 'IMAGE_ID'

        // When
        let promise = containers.deleteFile(tripId, imageId)

        // Then
        return promise.then(() => {
          createClientStub.removeFile.should.have.been.calledWith(tripId, imageId)
        })
      })
    })

    describe(':destroy', () => {
      it('checks sanity', () => {
        containers.destroy.should.exist
      })

      it('should create a storageClient', () => {
        // When
        containers.destroy()

        // Then
        pkgcloud.storage.createClient.should.have.been.calledWith(storageConfig)
      })

      it('should call destroyContainer', () => {
        // Given
        let tripId = '2345678'

        // When
        containers.destroy(tripId)

        // Then
        createClientStub.destroyContainer.should.have.been.calledWith(tripId)
      })

      it('should return a rejected promise when unable to destroy the container', () => {
        // Given
        let tripId = '873'
        createClientStub.destroyContainer.callsArgWith(1, new Error('Unable to destroy container'))

        // When
        let promise = containers.destroy(tripId)

        // Then
        return promise.then(() => {
          throw new Error('Should not be successfull')
        }, (error) => {
          error.should.be.an.instanceof(shared.errors.classes.ContainerError)
          error.message.should.equal('Unable to destroy container')
        })
      })

      it('should return a resolved promise when deletion worked', () => {
        // Given
        let tripId = '873'
        createClientStub.destroyContainer.callsArgWith(1, null, {})

        // When
        let promise = containers.destroy(tripId)

        // Then
        return promise.catch((error) => {
          error.should.be.an.instanceof(shared.errors.classes.ContainerError)
          error.message.should.equal('Unable to destroy container')
        })
      })
    })
  })
})
