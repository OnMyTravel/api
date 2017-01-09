const config = require('config')
const Trip = require(config.get('app-folder') + '/trips/model')
const tripMiddleware = require(config.get('app-folder') + '/trips/middleware')
const sinon = require('sinon')
const mongoose = require('mongoose')
const httpMocks = require('node-mocks-http')
const shared = require(config.get('app-folder') + '/shared')

const chai = require('chai')
const sinonChai = require('sinon-chai')
chai.should()
chai.use(sinonChai)

describe('Trip', () => {
  describe('middleware', () => {
    let owner_id, trip, token
    before((done) => {
      owner_id = mongoose.Types.ObjectId()
      token = shared.tokens.create(owner_id, '')
      new Trip({ name: 'My already created trip', owner_id }).save((err, createdTrip) => {
        trip = createdTrip
        done(err)
      })
    })

    describe(':exists', () => {
      describe('when the trip exists', () => {
        it('should call the next() if the trip exists', (done) => {
          // Given
          var next = sinon.spy()
          let response = httpMocks.createResponse()
          let request = httpMocks.createRequest({
            url: '',
            params: {
              tripid: trip._id
            }
          })

          // When
          let middlewarePromise = tripMiddleware.exists(request, response, next)

          // Then
          middlewarePromise.finally(() => {
            next.should.have.been.called
            done()
          })
        })
      })

      describe('when the trip does not exist', () => {
        it('should return NOT_FOUND', (done) => {
          // Given
          var next = sinon.spy()
          let response = httpMocks.createResponse()
          let request = httpMocks.createRequest({
            url: '',
            params: {
              tripid: mongoose.Types.ObjectId().toString()
            }
          })

          // When
          let middlewarePromise = tripMiddleware.exists(request, response, next)

          // Then
          middlewarePromise.finally(() => {
            next.should.not.have.been.called
            response.statusCode.should.be.equal(404)
            done()
          })
        })
      })
    })

    describe(':existsAndIsEditable', () => {
      describe('when the trip exists', () => {
        describe('and owned by the current user', () => {
          it('should call the next()', (done) => {
            // Given
            var next = sinon.spy()
            let response = httpMocks.createResponse()
            let request = httpMocks.createRequest({
              url: '',
              params: {
                tripid: trip._id
              },
              headers: {
                'Authorization': 'Bearer ' + token
              }
            })

            // When
            let middlewarePromise = tripMiddleware.existsAndIsEditable(request, response, next)

            // Then
            middlewarePromise.finally(() => {
              next.should.have.been.called
              done()
            })
          })
        })

        describe('and cant be edited by the current user', () => {
          it('should return FORBIDDEN', (done) => {
            // Given
            let anotherUserToken = shared.tokens.create(mongoose.Types.ObjectId(), '')
            var next = sinon.spy()
            let response = httpMocks.createResponse()
            let request = httpMocks.createRequest({
              url: '',
              params: {
                tripid: trip._id
              },
              headers: {
                'Authorization': 'Bearer ' + anotherUserToken
              }
            })

            // When
            let middlewarePromise = tripMiddleware.existsAndIsEditable(request, response, next)

            // Then
            middlewarePromise.finally(() => {
              response.statusCode.should.be.equal(403)
              next.should.not.have.been.called
              done()
            })
          })
        })
      })

      describe('when the trip does not exist', () => {
        it('should return NOT_FOUND', (done) => {
          // Given
          var next = sinon.spy()
          let response = httpMocks.createResponse()
          let request = httpMocks.createRequest({
            url: '',
            params: {
              tripid: mongoose.Types.ObjectId().toString()
            },
            headers: {
              'Authorization': 'Bearer ' + token
            }
          })

          // When
          let middlewarePromise = tripMiddleware.existsAndIsEditable(request, response, next)

          // Then
          middlewarePromise.finally(() => {
            next.should.not.have.been.called
            response.statusCode.should.be.equal(404)
            done()
          })
        })
      })
    })
  })
})
