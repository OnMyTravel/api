/* global describe, it, before */
let Trip = require('../../app/trips/model')
let app = require(require('config').get('app-root') + '/index')

let faker = require('faker')
let chai = require('chai')
let chaiHttp = require('chai-http')

chai.should()
chai.use(chaiHttp)

describe('Trips', function () {
  describe('controller', function () {
    describe(':getAll', () => {
      let trip
      before(function (done) {
        trip = new Trip({ name: faker.lorem.sentence() })
        trip.save((e, newTrip) => {
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
          .end((e, res) => {
            res.should.have.status(401)
            res.headers.should.have.property('www-authenticate', 'bearer')
            done()
          })
      })
    })

    describe(':create', () => {
      describe('when not authenticated', () => {
        it('should return Unauthorized', (done) => {
          chai.request(app)
            .post('/trips')
            .end((e, res) => {
              res.should.have.status(401)
              done()
            })
        })

        it('should add www-authenticate header', (done) => {
          chai.request(app)
            .post('/trips')
            .end((e, res) => {
              res.should.have.status(401)
              res.headers.should.have.property('www-authenticate', 'bearer')
              done()
            })
        })
      })

      describe('when the request payload is incorrect', () => {
        it('should BAD REQUEST', (done) => {
          chai.request(app)
            .post('/trips')
            .set('Authorization', 'Bearer cn389ncoiwuencr')
            .send({})
            .end((e, res) => {
              res.should.have.status(400)
              done()
            })
        })
      })

      describe('when the payload is OK', () => {
        it('should return CREATED status', (done) => {
          chai.request(app)
            .post('/trips')
            .set('Authorization', 'Bearer cn389ncoiwuencr')
            .send({ name: 'Lorem ipsum' })
            .end((e, res) => {
              res.should.have.status(201)
              res.body.should.have.property('name', 'Lorem ipsum')
              res.body.should.have.property('_id')
              done()
            })
        })
      })
    })
  })
})
