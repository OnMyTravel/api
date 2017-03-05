const sinon = require('sinon')
const config = require('config')
const proxyquire = require('proxyquire').noPreserveCache()
const chai = require('chai')
chai.should()

let getStub = sinon.stub()
let getImageStub = sinon.stub()
let fileExistsStub = sinon.stub()

let mocks = {
  'express': {
    Router: sinon.stub().returns({
      get: getStub,
      post: sinon.stub(),
      delete: sinon.stub(),
      put: sinon.stub()
    })
  },

  './controller': {
    getImage: getImageStub
  },

  './middleware': {
    fileExists: fileExistsStub
  }
}

proxyquire(config.get('app-folder') + '/steps/routes', mocks)

describe('Steps', () => {
  describe('Routes', () => {
    describe('/:stepid/image/:imageid', () => {
      it('should exists', () => {
        getStub.should.have.been.calledWith('/:stepid/images/:imageid', fileExistsStub, getImageStub)
      })
    })
  })
})
