/* global describe it */
const app = require('../../app/index')
const db = require('../../database')
const { Trip, Day, Paragraph } = require('../../app/models')
const Faker = require('faker')
const mongoose = require('mongoose')

const chai = require('chai')
const chaiHttp = require('chai-http')
chai.should()
chai.use(chaiHttp)

describe('Functional | Trip | get-trip-details', () => {
  let dbConnexion
  beforeEach(() => {
    dbConnexion = db.openDatabaseConnexion()
  })

  afterEach(() => {
    return dbConnexion.close()
  })

  describe(':get', () => {
    describe('when the trip does not exist', () => {
      it('should return NOT_FOUND', () => {
        // when
        const request = chai.request(app)
          .get('/trips/' + mongoose.Types.ObjectId())

        // then
        return request.then((res) => {
          res.should.have.status(404)
        })
      })

      describe('when the trip exists', () => {
        let trip
        let day
        beforeEach(() => {
          return new Trip({
            owner_id: mongoose.Types.ObjectId(),
            name: 'Hello'
          }).save()
            .then((createdTrip) => { trip = createdTrip })
            .then(() => {
              return new Day({ trip: { id: trip.id }, content: ['Paragraph text without type'] }).save()
            })
            .then((createdDay) => { day = createdDay })
        })

        afterEach(() => Day.deleteMany())

        it('should return the trip with no relations to days', () => {
          // when
          const request = chai.request(app).get(`/trips/${trip.id}`)

          // then
          return request.then((res) => {
            res.should.have.status(200)
            res.body.should.deep.equal({
              'data': {
                'attributes': {
                  name: 'Hello'
                },
                'id': trip.id.toString(),
                'relationships': {
                  'days': {
                    data: [
                      { type: 'days', id: day.id }
                    ]
                  }
                },
                'type': 'trips'
              }
            })
          })
        })
      })
    })
  })
})
