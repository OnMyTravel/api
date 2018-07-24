/* global describe it */
const app = require('../../app/index')
const db = require('../../database')
const { Trip } = require('../../app/models')
const Faker = require('faker')
const mongoose = require('mongoose')

const chai = require('chai')
const chaiHttp = require('chai-http')
chai.should()
chai.use(chaiHttp)

describe('Functional | Day | create-a-new-day', () => {
  let dbConnexion
  beforeEach(() => {
    dbConnexion = db.openDatabaseConnexion()
  })

  afterEach(() => {
    return dbConnexion.close()
  })

  describe(':post', () => {
    describe('when the day does not exists', () => {
      it('should return NOT_FOUND', () => {
        // given
        const tripId = mongoose.Types.ObjectId()

        // when
        const request = chai.request(app).post('/days/')
          .send({
            'data': {
              'type': 'days',
              'attributes': {
                'ignored': 'params'
              },
              'relationships': {
                'trip': {
                  'data': {
                    'type': 'trips', 'id': tripId
                  }
                }
              }
            }
          })

        // then
        return request.then((res) => {
          res.should.have.status(404)
        })
      })
    })

    describe('when the trip exists', () => {
      let trip

      beforeEach(() => {
        let name = Faker.lorem.sentence()
        let ownerId = mongoose.Types.ObjectId()

        return Trip.create({ name, owner_id: ownerId })
          .then((createdTrip) => {
            trip = createdTrip
          })
      })

      it('should return OK with created element', () => {
        // when
        const request = chai.request(app).post(`/days`)
          .send({
            'data': {
              'type': 'days',
              'attributes': {
                'ignored': 'params'
              },
              'relationships': {
                'trip': {
                  'data': {
                    'type': 'trips', 'id': trip._id
                  }
                }
              }
            }
          })

        // then
        return request.then((res) => {
          res.should.have.status(201)
          res.body.should.have.all.deep.keys({
            'data': {
              'attributes': {},
              'id': '5b51cd7fc52075515fd85d1f',
              'relationships': {
                'content': {
                  'data': []
                }
              },
              'type': 'day'
            }
          })
        })
      })
    })
  })
})
