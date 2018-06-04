const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);

const TripController = require('../../app/trips/controller');

const config = require('config')
const mongoose = require('mongoose')
const httpMocks = require('node-mocks-http')

const shared = require('../../app/shared')
const tripRepository = require('../../app/trips/repository')
const stepRepository = require('../../app/steps/repository')

const TRIP_ID = 1234567
const TRIP = { _id: TRIP_ID, name: 'My super trip' }


describe('Unit | Trip | Controller', () => {
  describe(':create', () => {

    const sandbox = sinon.createSandbox();
    
    beforeEach(() => {
      sandbox.stub(shared.containers, 'create').resolves()
      sandbox.stub(tripRepository, 'create').resolves(TRIP)
    });

    afterEach(() => {
      sandbox.restore();
    });

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
          shared.containers.create.should.have.been.calledWith(TRIP_ID)
          response.statusCode.should.equal(201)
        })
      })

      it('should return payload', () => {
        // When
        let t = TripController.create(request, response)

        // Then
        return t.then(() => {
          shared.containers.create.should.have.been.calledWith(TRIP_ID)
          response.statusCode.should.equal(201)

          let responseBody = JSON.parse(response._getData())
          responseBody._id.should.equal(TRIP_ID)
          responseBody.owner_id.should.equal(userId.toString())
          responseBody.name.should.equal('My super trip')
        })
      })
    })

    describe('when containers creation failed', () => {
      beforeEach(() => {
        shared.containers.create.withArgs(TRIP_ID).rejects();
      });

      it('should return a bad gateway', () => {
        // Given
        let response = httpMocks.createResponse();
        let request = httpMocks.createRequest({
          method: 'POST',
          url: '/trips',
          headers: {
            'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4NjY5MzdkMzQ3NjYxNzY0MzY0ZmNmOCIsImZhY2Vib29rX2FjY2Vzc190b2tlbiI6IkVBQUNFZEVvc2UwY0JBRTI2VzJmM3M0QVpDUFNpSmNMZkNHTmd1SGVNME9jdUdXU1NWOTBPeE9OdHh5clg0TUZrakVkOVpBbko3NTVXN0NFYUhCYlpCY1lqcllaQkRVUnlwYWtsazJsQWtJR2Q3RlA2QWV2eFF2OWVFU0xveW5xSUtMZkxFbUFWaGRGV2loaGxPOEg5aGtSZEFtYk93M1pDU3Fmc1pBWkFmQnl4d1pEWkQiLCJpYXQiOjE0ODUxNjEzOTUsImV4cCI6MTQ4NTE2NDk5NX0.b4UaaskpGlWxVAcFsFKl3cUhstszER6cxUrCWUaqRik'
          }
        });

        // When
        let t = TripController.create(request, response);

        // Then
        return t.then(() => {
          shared.containers.create.should.have.been.calledWith(TRIP_ID);
          response.statusCode.should.equal(502);
        })
      })
    })
  })

  describe(':deleteOne', () => {
    let response, request
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
      response = httpMocks.createResponse()
      request = httpMocks.createRequest({
        method: 'DELETE',
        url: '/trips/58bea7087947bd35daea1d93',
        params: {
          tripid: '58bea7087947bd35daea1d93'
        }
      })

      sandbox.stub(shared.containers, 'create')
      sandbox.stub(shared.containers, 'destroy').resolves()
      sandbox.stub(tripRepository, 'deleteById').resolves()
      sandbox.stub(stepRepository, 'deleteByTripId').resolves()
    })

    afterEach(() => {
      sandbox.restore();
    });

    it('checks sanity', () => {
      TripController.deleteOne.should.be.defined
    })

    it('should destroy its container', () => {
      // When
      let promise = TripController.deleteOne(request, response)

      // Then
      return promise.then(() => {
        shared.containers.destroy.should.have.been.called;
        shared.containers.destroy.should.to.have.been.calledWith('58bea7087947bd35daea1d93');
      })
    })

    describe('when we cannot destroy container', () => {
      it('should return INTERNAL_SERVER_ERROR', () => {
        // Given
        shared.containers.destroy.rejects()

        // When
        let promise = TripController.deleteOne(request, response)

        // Then
        return promise.then(() => {
          response.statusCode.should.equal(500)
          response.getHeader('Content-Type').should.equal('application/json')

          tripRepository.deleteById.should.not.have.been.called
          tripRepository.deleteById.should.not.have.been.called
        })
      })
    })

    describe('when we destroyed container', () => {
      it('should remove trip', () => {
        // When
        let promise = TripController.deleteOne(request, response)

        // Then
        return promise.then(() => {
          tripRepository.deleteById.should.have.been.calledWith('58bea7087947bd35daea1d93')
        })
      })

      it('should return INTERNAL_SERVER_ERROR in case of error', () => {
        // Given
        tripRepository.deleteById.returns(Promise.reject())

        // When
        let promise = TripController.deleteOne(request, response)

        // Then
        return promise.then(() => {
          stepRepository.deleteByTripId.should.not.have.been.called
          response.statusCode.should.equal(500)
          response.getHeader('Content-Type').should.equal('application/json')
        })
      })

      describe('when we removed trip in database', () => {
        it('should remove step', () => {
          // When
          let promise = TripController.deleteOne(request, response)

          // Then
          return promise.then(() => {
            stepRepository.deleteByTripId.should.have.been.calledWith('58bea7087947bd35daea1d93')
            response.statusCode.should.equal(200)
            response.getHeader('Content-Type').should.equal('application/json')
          })
        })

        it('should return INTERNAL_SERVER_ERROR in case of error removing a step', () => {
          // Given
          stepRepository.deleteByTripId.returns(Promise.reject())

          // When
          let promise = TripController.deleteOne(request, response)

          // Then
          return promise.then(() => {
            response.statusCode.should.equal(500)
            response.getHeader('Content-Type').should.equal('application/json')
          })
        })
      })
    })
  })
})
