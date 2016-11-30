/* global describe it */
var index = require(require('config').get('app-folder') + '/index')
var request = require('supertest')

describe('Steps', function () {
  describe('controller', function () {
    describe(':get', function () {
      describe('when the user is not authenticated', function () {
        it('should return 401', function (done) {
          request(index)
            .get('/steps')
            .expect(401)
            .end(function (err) {
              done(err)
            })
        })

        it('should have an WWW-Authenticate', function (done) {
          request(index)
            .get('/steps')
            .expect('WWW-Authenticate', 'bearer')
            .end(function (err) {
              done(err)
            })
        })
      })
    })
  })
})
