/* global describe, it */
var proxyquire = require('proxyquire').noPreserveCache()
var sinon = require('sinon')
var chai = require('chai')
chai.use(require('sinon-chai'))
var expect = chai.expect

var mocks = {
  'mongoose': {
    'connect': sinon.spy(),
    'connection': { on: function () {} }
  },
  './app': {
    'listen': sinon.stub()
  }
}

// We load the module and mock some dependencies
proxyquire('../index', mocks)

describe('Application starter', function () {
  it('should set the application listening on the configuration port', function () {
    expect(mocks['./app'].listen).to.have.been.calledWith(3000)
  })
})
