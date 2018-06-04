/* global describe, it */
const index = require('../../app/index')
const request = require('supertest')
const expect = require('chai').expect

describe('API', function () {
  it('should have api informations on root', function (done) {
    request(index)
      .get('/')
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) {
          done(err)
        }

        expect(res.body).to.have.property('description')
        expect(res.body).to.have.property('version')
        done()
      })
  })
})
