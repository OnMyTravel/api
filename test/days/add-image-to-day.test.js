/* global describe it */
const app = require('../../app/index')
const db = require('../../database')
const { Image, Day, Paragraph } = require('../../app/models')
const Faker = require('faker')
const mongoose = require('mongoose')

const fs = require('fs')

const chai = require('chai')
const expect = chai.expect
const chaiHttp = require('chai-http')
chai.should()
chai.use(chaiHttp)

describe('Functional | Day | add-image-to-day', () => {
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
        .post(`/days/${mongoose.Types.ObjectId()}/images`)
        .type('form')
        .attach('image', fs.readFileSync('./test/days/starWithGPS.jpg'), 'avatar.png')

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

    // afterEach(() => {
    //   return Day.deleteMany()
    // })

    it('should register the day', () => {
      // when
      const request = chai.request(app)
        .post(`/days/${day._id}/images`)
        .type('form')
        .attach('image', fs.readFileSync('./test/days/starWithGPS.jpg'), 'avatar.png')
        .field('caption', 'My super caption')
        .field('GPSLatitude', '42.486186')
        .field('GPSLongitudeRef', 'N')
        .field('GPSLatitudeRef', 'E')
        .field('GPSLongitude', '42.486186')
        .field('GPSAltitudeRef', '87.154816')
        .field('GPSAltitude', '42.153186015')

      // then
      return request
        .then((res) => {
          res.should.have.status(201)
        })
        .then(() => Day.findById(day._id))
        .then((day) => {
          expect(day.content).to.have.a.lengthOf(1)
          expect(day.content[0]).to.include({
            'type': 'image',
            caption: 'My super caption',
          })
          expect(day.content[0].gps).to.include({
            'GPSLatitudeRef': 'E',
            'GPSLatitude': 42.486186,
            'GPSLongitudeRef': 'N',
            'GPSLongitude': 42.486186,
            'GPSAltitudeRef': 87.154816,
            'GPSAltitude': 42.153186015
          })
          expect(day.content[0].path).to.match(/[a-zA-Z0-9]+\.png/)
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
