/* global describe it */
const sinon = require('sinon')
const expect = require('chai').expect

const handleNonExpectedErrors = require('../../app/handlers/handleNonExpectedErrors')

describe('Unit | Handler | handleNonExpectedErrors', () => {
  it('should reply with a 500 error', () => {
    // given
    const error = new Error('Something bad is happening to earth')
    const json = sinon.stub()
    const status = sinon.stub().returns({ json })
    const res = { status }
    const next = sinon.stub()

    // when
    handleNonExpectedErrors(error, {}, res, next)

    // then
    expect(status).to.have.been.calledWith(500)
    expect(json).to.have.been.calledWith({
      'errors': [
        {
          'code': '500',
          'title': 'Value is too short',
          'detail': 'Something bad is happening to earth'
        }
      ]
    })
  })
})
