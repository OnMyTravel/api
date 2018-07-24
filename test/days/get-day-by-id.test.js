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

describe('Functional | Day | get-day-by-id', () => {
  let dbConnexion
  beforeEach(() => {
    dbConnexion = db.openDatabaseConnexion()
  })

  afterEach(() => {
    return dbConnexion.close()
  })

  describe(':get', () => {
    describe('when the day does not exists', () => {
      it('should return NOT_FOUND', () => {
        // when
        const request = chai.request(app)
          .get('/days/' + mongoose.Types.ObjectId())

        // then
        return request.then((res) => {
          res.should.have.status(404)
        })
      })
    })

    describe('when the day exists', () => {
      let day
      let paragraph

      beforeEach(() => {
        let name = Faker.lorem.sentence()
        let ownerId = mongoose.Types.ObjectId()
        paragraph = new Paragraph({ content: ['The paragraph'] })

        return Trip.create({ name, owner_id: ownerId })
          .then((createdTrip) => {
            return Day.create({ trip: { id: createdTrip.id }, content: [paragraph] })
          })
          .then((createdDay) => {
            day = createdDay
          })
      })

      it('should return OK', () => {
        // when
        const request = chai.request(app).get('/days/' + day._id)

        // then
        return request.then((res) => {
          res.should.have.status(200)
        })
      })

      it('should return day\'s steps', () => {
        // when
        const request = chai.request(app).get('/days/' + day._id)

        return request.then((res) => {
          res.should.have.status(200)
          res.body.should.deep.equal({
            'data': {
              'attributes': {},
              'id': day._id.toString(),
              'relationships': {
                'content': {
                  'data': [
                    {
                      'id': paragraph._id.toString(),
                      'type': 'paragraph'
                    }
                  ]
                }
              },
              'type': 'day'
            },
            'included': [
              {
                'attributes': {
                  'content': [
                    'The paragraph'
                  ]
                },
                'id': paragraph._id.toString(),
                'type': 'paragraph'
              }
            ]
          })
        })
      })
    })
  })
})
