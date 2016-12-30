/* global describe, it, before */
let app = require(require('config').get('app-root') + '/index')
let shared = require(require('config').get('app-folder') + '/shared')

let chai = require('chai')
let chaiHttp = require('chai-http')
let mongoose = require('mongoose')

chai.should()
chai.use(chaiHttp)

describe('Trips', function () {
  describe('controller', function () {
    xdescribe(':getAll', () => {
      describe('when the user is not authenticated', () => {
        it('should answer UNAUTHORIZED', (done) => {
          chai.request(app)
            .get('/trips')
            .end((e, res) => {
              res.should.have.status(401)
              done()
            })
        })
      })

      describe('when the user has correctly authenticated himself', () => {
        let token
        before(function () {
          token = shared.tokens.create(mongoose.Types.ObjectId(), '')

        })

        it('it should GET all the trips', (done) => {
          chai.request(app)
            .get('/trips')
            .set('Authorization', 'Bearer ' + token)
            .end((err, res) => {
              if (err) { done(err) }

              res.should.have.status(200)
              res.body.should.be.a('array')
              res.body.length.should.be.eql(1)

              let trip = res.body[0]
              trip.id.should.equal()
              done()
            })
        })
      })
    })

    describe(':create', () => {
      let token
      let userId
      before(() => {
        userId = mongoose.Types.ObjectId().toString()
        token = shared.tokens.create(userId, '')
      })

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
            .set('Authorization', 'Bearer ' + token)
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
            .set('Authorization', 'Bearer ' + token)
            .send({ name: 'Lorem ipsum' })
            .end((e, res) => {
              res.should.have.status(201)
              done()
            })
        })

        it('should return the created trip, with user as payload', (done) => {
          chai.request(app)
            .post('/trips')
            .set('Authorization', 'Bearer ' + token)
            .send({ name: 'Lorem ipsum' })
            .end((e, res) => {
              res.body.should.have.property('name', 'Lorem ipsum')
              res.body.should.have.property('_id')
              res.body.should.have.property('owner_id', userId)
              done()
            })
        })
      })
    })
  })
})
