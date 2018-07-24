/* global describe it */
const app = require('../../app/index')
const db = require('../../database')
const { Trip, Day, Paragraph } = require('../../app/models')
const Faker = require('faker')
const mongoose = require('mongoose')

const chai = require('chai')
const expect = chai.expect
const chaiHttp = require('chai-http')
chai.should()
chai.use(chaiHttp)

describe('Functional | Day | add-paragraph-to-day', () => {
  let dbConnexion
  beforeEach(() => {
    dbConnexion = db.openDatabaseConnexion()
  })

  afterEach(() => {
    return dbConnexion.close()
  })

  describe('when the day does not exist', () => {
    it('should return NOT_FOUND', () => {
      // when
      const request = chai.request(app)
        .post(`/days/${mongoose.Types.ObjectId()}/paragraphs`)
        .send({
          'data': {
            'type': 'paragraphs',
            'attributes': {
              'content': [
                'Nouveau paragraphe'
              ]
            },
            'relationships': {
              'day': {
                'data': {
                  'type': 'days', 'id': '165'
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

  describe('when the day exists', () => {
    let day
    let payload
    beforeEach(() => {
      return new Day({ trip: { id: mongoose.Types.ObjectId() } })
        .save()
        .then((createdDay) => {
          day = createdDay

          payload = _buildPayload(['Nouveau paragraphe'], createdDay)
        })
    })

    afterEach(() => {
      return Day.deleteMany()
    })

    it('should register the day', () => {
      // when
      const request = chai.request(app)
        .post(`/days/${day._id}/paragraphs`)
        .send(payload)

      // then
      return request.then((res) => {
        res.should.have.status(201)
      })
    })

    it('should append the paragraph to the day', () => {
      // when
      const request = chai.request(app)
        .post(`/days/${day._id}/paragraphs`)
        .send(payload)

      // then
      return request.then(() => Day.findById(day._id))
        .then((day) => {
          expect(day.content).to.have.a.lengthOf(1)
        })
    })

    describe('when the day already has a content', () => {
      let day
      beforeEach(() => {
        return new Day({ trip: { id: mongoose.Types.ObjectId() }, content: [new Paragraph({ content: ['Premier Paragraphe'] })] })
          .save()
          .then((createdDay) => {
            day = createdDay
          })
      })

      it('should append the paragraph to the day', () => {
        // when
        const request = chai.request(app)
          .post(`/days/${day._id}/paragraphs`)
          .send(_buildPayload(['Nouveau paragraphe'], day))

        // then
        return request.then(() => Day.findById(day._id))
          .then((day) => {
            expect(day.content).to.have.a.lengthOf(2)
            expect(day.content[0].content).to.deep.equal(['Premier Paragraphe'])
            expect(day.content[1].content).to.deep.equal(['Nouveau paragraphe'])
          })
      })
    })
  })
})

// PRIVATE
function _buildPayload(content, day) {
  return {
    'data': {
      'type': 'paragraphs',
      'attributes': {
        'content': content
      },
      'relationships': {
        'day': {
          'data': {
            'type': 'days', 'id': day._id
          }
        }
      }
    }
  }
}
