const config = require('config')
const Trip = require(config.get('app-folder') + '/trips/model')
const tripMiddleware = require(config.get('app-folder') + '/trips/middleware')
const sinon = require('sinon')
const mongoose = require('mongoose')
const httpMocks = require('node-mocks-http')
const shared = require(config.get('app-folder') + '/shared')

const db = require('../../database')

const chai = require('chai')
const sinonChai = require('sinon-chai')
chai.should()
chai.use(sinonChai)

describe('Integration | Trip | Middleware', () => {
  let ownerId, trip, token, connexion

  beforeEach(() => {
    connexion = db.openDatabaseConnexion()

    ownerId = mongoose.Types.ObjectId()
    token = shared.tokens.create(ownerId, '')
    return Trip.create({ name: 'My already created trip', owner_id: ownerId })
      .then((createdTrip) => {
        trip = createdTrip
      })
  })

  afterEach(() => {
    return Trip.remove({}).then(() => {
      connexion.close()
    })
  })

  describe(':exists', () => {
    describe('when the trip exists', () => {
      it('should call the next() if the trip exists', () => {
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
        return middlewarePromise.then(() => {
          next.should.have.been.called
        })
      })
    })

    describe('when the trip does not exist', () => {
      it('should return NOT_FOUND', () => {
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
        return middlewarePromise.then(() => {
          next.should.not.have.been.called
          response.statusCode.should.be.equal(404)
        })
      })
    })
  })

  describe(':existsAndIsEditable', () => {
    describe('when the trip exists', () => {
      describe('and owned by the current user', () => {
        it('should call the next()', () => {
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
          return middlewarePromise.then(() => {
            next.should.have.been.called
          })
        })
      })

      describe('and cant be edited by the current user', () => {
        it('should return FORBIDDEN', () => {
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
          return middlewarePromise.then(() => {
            response.statusCode.should.be.equal(403)
            next.should.not.have.been.called
          })
        })
      })
    })

    describe('when the trip does not exist', () => {
      it('should return NOT_FOUND', () => {
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
        return middlewarePromise.then(() => {
          next.should.not.have.been.called
          response.statusCode.should.be.equal(404)
        })
      })
    })
  })
})
