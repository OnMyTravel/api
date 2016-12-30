const shared = require(require('config').get('app-folder') + '/shared')
const chai = require('chai')
chai.should()

describe('Shared', () => {
  describe('errors', () => {

    it('checks sanity', () => {
      shared.should.have.property('errors')
    })

    describe(':format', () => {
      let errorMessage, expectedMessage
      before(() => {
        errorMessage = {
            message: 'Trip validation failed',
            name: 'ValidationError',
            errors: {
                name: {
                    message: 'Path `name` is required.',
                    name: 'ValidatorError',
                    properties: [Object],
                    kind: 'required',
                    path: 'name'
                }
            }
        }

        expectedMessage = {
          message: 'Trip validation failed',
          name: 'ValidationError',
          errors: {
            name: {
              message: 'Path `name` is required.',
              kind: 'required'
            }
          }
        }
      })

      it('checks sanity', () => {
        shared.errors.should.have.property('format')
      })

      it('should transform mongoose errors', () => {
        let result = shared.errors.format(errorMessage)
        result.should.be.deep.equal(expectedMessage)
      })
    })
  })
})
