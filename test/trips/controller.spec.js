/* global describe, it, before */
let app = require('../../index')
let Trip = require('../../app/trips/model')

let mongoose = require('mongoose')
let mockgoose = require('mockgoose')
let faker = require('faker')
let chai = require('chai')
let chaiHttp = require('chai-http')

chai.should()
chai.use(chaiHttp)

before(function (done) {
  mockgoose(mongoose).then(function () {
    mongoose.connect('mongodb://127.0.0.1/TestingDB', function (err) {
      done(err)
    })
  })
})

describe('Trips', function () {
  describe('controller', function () {
    describe(':getAll', () => {
      let trip
      before(function (done) {
        trip = new Trip({ name: faker.lorem.sentence() })
        trip.save((err, newTrip) => {
          trip = newTrip
          done()
        })
      })

      it('it should GET all the trips', (done) => {
        chai.request(app)
          .get('/trips')
          .set('Authorization', 'Bearer cn389ncoiwuencr')
          .end((err, res) => {
            if (err) { done(err) }

            res.should.have.status(200)
            res.body.should.be.a('array')
            res.body.length.should.be.eql(0)
            done()
          })
      })

      it('should return 401 Unauthorized when no token is provided', function (done) {
        chai.request(app)
          .get('/trips')
          .end((err, res) => {
            res.should.have.status(401)
            res.headers.should.have.property('www-authenticate', 'bearer')
            done()
          })
      })
    })
  })
})
