/* global describe, it, after */
var proxyquire = require('proxyquire').noPreserveCache()
var sinon = require('sinon')
var chai = require('chai')
chai.use(require('sinon-chai'))
var expect = chai.expect

var mocks = {
  'mongoose': {
    'connect': sinon.spy()
  },
  './app': {
    'listen': sinon.stub()
  },
  './config': {
    db: 'mongodb://localhost/test',
    app: {
      port: 1234
    }
  }
}

// We load the module and mock some dependencies
proxyquire('../index', mocks);

describe('Application starter', function () {
  it('should connect to mongodb using configuration details', function () {
    // Then
    expect(mocks.mongoose.connect).to.have.been.calledWith('mongodb://localhost/test')
  })

  it('should set the application listening on the configuration port', function () {
    expect(mocks['./app'].listen).to.have.been.calledWith(1234)
  })
})
