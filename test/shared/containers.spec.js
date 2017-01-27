const config = require('config')
const shared = require(config.get('app-folder') + '/shared')
const proxyquire = require('proxyquire').noPreserveCache()

const chai = require('chai')
const sinon = require('sinon')
chai.should()

let createContainerStub = sinon.stub()
createContainerStub.withArgs({ name: 'tripOnSuccess' }).callsArgWith(1, null, { message: 'SUCCESS' })
createContainerStub.withArgs({ name: 'tripOnError' }).callsArgWith(1, { message: 'FAILURE' }, null)

const createClientStub = sinon.stub().returns({
  // getContainer: getContainerStub,
  // upload: uploadStub
  createContainer: createContainerStub
})

var pkgcloudStub = {
  storage: {
    createClient: createClientStub
  }
}

const storageConfig = {
  storage: {
    provider: 'openstack',
    username: 'd5GAz50NhkJa',
    password: 'd5GAz50NhkJad5GAz50NhkJad5GAz50NhkJa',
    authUrl: 'https://auth.provider.io/',
    tenantId: '6a78f42725673f4s725GaC6S3d5c7620',
    region: 'REG1'
  }
}

const containers = proxyquire(config.get('app-folder') + '/shared/containers', {
  pkgcloud: pkgcloudStub,
  config: {
    get: sinon.stub().returns(storageConfig)
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
        containers
          .create(tripId)

        // Then
        createClientStub.should.have.been.calledWith(storageConfig)
      })

      it('should use create a container', () => {
        // Given
        let tripId = '1234567890'

        // When
        containers
          .create(tripId)

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

      it('should return a rejected promise with the error', (done) => {
        // Given
        let tripId = 'tripOnError'

        // When
        containers
          .create(tripId)
          .then(() => {
            done(new Error('Should be on error'))
          }, (error) => {
            error.should.deep.equal({ message: 'FAILURE' })
            done()
          })

        // Then
        createContainerStub.should.have.been.calledWith({ name: tripId })
      })
    })
  })
})
