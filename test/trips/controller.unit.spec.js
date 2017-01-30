require('chai').should()

const config = require('config')
const sinon = require('sinon')
const mongoose = require('mongoose')
const proxyquire = require('proxyquire').noPreserveCache()
const httpMocks = require('node-mocks-http')
const shared = require(config.get('app-folder') + '/shared')

const TRIP_ID = 1234567
const TRIP = { _id: TRIP_ID, name: 'My super trip' }
let createContainerStub = sinon.stub()
createContainerStub.withArgs(TRIP_ID).returns(new Promise((resolve, reject) => { resolve() }))

let mocks = {
  '../shared': {
    containers: {
      create: createContainerStub
    }
  },
  './repository': {
    create: sinon.stub().returns(new Promise((resolve, reject) => { resolve(TRIP) }))
  }
}

const TripController = proxyquire(config.get('app-folder') + '/trips/controller', mocks)

describe('Trip', () => {
  describe('controller:unit', () => {
    describe(':create', () => {
      it('checks sanity', () => {
        TripController.create.should.be.defined
      })

      describe('when containers creation is OK', () => {
        let response, request, token, userId

        beforeEach(() => {
          userId = mongoose.Types.ObjectId()
          token = shared.tokens.create(userId, '')
          response = httpMocks.createResponse()
          request = httpMocks.createRequest({
            method: 'POST',
            url: '/trips',
            headers: {
              'authorization': 'Bearer ' + token.toString()
            },
            body: TRIP
          })
        })

        it('should create a container', () => {
          // When
          let t = TripController.create(request, response)

          // Then
          return t.then(() => {
            createContainerStub.should.have.been.calledWith(TRIP_ID)
            response.statusCode.should.equal(201)
          })
        })

        it('should return payload', () => {
          // When
          let t = TripController.create(request, response)

          // Then
          return t.then(() => {
            createContainerStub.should.have.been.calledWith(TRIP_ID)
            response.statusCode.should.equal(201)

            let responseBody = JSON.parse(response._getData())
            responseBody._id.should.equal(TRIP_ID)
            responseBody.owner_id.should.equal(userId.toString())
            responseBody.name.should.equal('My super trip')
          })
        })
      })

      describe('when containers creation failed', () => {
        before(() => {
          createContainerStub.reset()
          createContainerStub.withArgs(TRIP_ID).returns(new Promise((resolve, reject) => { reject() }))
        })

        it('should return a bad gateway', () => {
          // Given
          let response = httpMocks.createResponse()
          let request = httpMocks.createRequest({
            method: 'POST',
            url: '/trips',
            headers: {
              'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4NjY5MzdkMzQ3NjYxNzY0MzY0ZmNmOCIsImZhY2Vib29rX2FjY2Vzc190b2tlbiI6IkVBQUNFZEVvc2UwY0JBRTI2VzJmM3M0QVpDUFNpSmNMZkNHTmd1SGVNME9jdUdXU1NWOTBPeE9OdHh5clg0TUZrakVkOVpBbko3NTVXN0NFYUhCYlpCY1lqcllaQkRVUnlwYWtsazJsQWtJR2Q3RlA2QWV2eFF2OWVFU0xveW5xSUtMZkxFbUFWaGRGV2loaGxPOEg5aGtSZEFtYk93M1pDU3Fmc1pBWkFmQnl4d1pEWkQiLCJpYXQiOjE0ODUxNjEzOTUsImV4cCI6MTQ4NTE2NDk5NX0.b4UaaskpGlWxVAcFsFKl3cUhstszER6cxUrCWUaqRik'
            }
          })

          // When
          let t = TripController.create(request, response)

          // Then
          return t.then(() => {
            createContainerStub.should.have.been.calledWith(TRIP_ID)
            response.statusCode.should.equal(502)
          })
        })
      })
    })
  })
})
