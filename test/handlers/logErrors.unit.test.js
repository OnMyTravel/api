/* global describe it */
const sinon = require('sinon')
const expect = require('chai').expect

const logErrors = require('../../app/handlers/logErrors')

describe('Unit | Handler | logErrors', () => {

  let loggerStub
  beforeEach(() => {
    loggerStub = sinon.stub(console, 'error')
  })

  afterEach(() => {
    loggerStub.restore()
  })

  it('should log any error', () => {
    // given
    const error = new Error('Something bad is happening to earth')
    const req = {}
    const res = {}
    const next = sinon.stub()

    // when
    logErrors(error, req, res, next)

    // then
    expect(console.error).to.have.been.calledWith(error)
    expect(next).to.have.been.calledWith(error)
  })
})
