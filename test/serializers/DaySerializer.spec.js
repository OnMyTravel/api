const mongoose = require('mongoose')
const expect = require('chai').expect

const DaySerializer = require('../../app/serializers/DaySerializer')

const { Day, Paragraph, Image } = require('../../app/models/index')

describe('Unit | Serializer | Day', () => {
  describe('deserialize', () => {
    it('should build a Day object', () => {
      // Given
      const payload = {
        'data': {
          'type': 'days',
          'attributes': {
            'ignored': 'params'
          },
          'relationships': {
            'trip': {
              'data': {
                'type': 'trips', 'id': '5b4123d71e768510b48a6d18'
              }
            }
          }
        }
      }

      // when
      const promise = DaySerializer.deserialize(payload)

      // then
      return expect(promise).to.be.fulfilled.and.then((result) => {
        expect(result).to.be.an.instanceOf(Day)
        expect(result.trip.id).to.deep.equal(mongoose.Types.ObjectId('5b4123d71e768510b48a6d18'))
      })
    })
  })

  describe('serialize', () => {
    it('should transform a compound Day object into JSONApi', () => {
      // Given
      const includedParagraph = new Paragraph({}).toJSON()
      const includedImage = new Image({
        caption: 'Image underlying message'
      }).toJSON()
      const day = new Day({
        content: [includedParagraph, includedImage]
      })

      // when
      const serializedDay = DaySerializer.serialize(day)

      // then
      expect(serializedDay).to.deep.equal({
        'data': {
          'type': 'day',
          'id': `${day.id}`,
          'attributes': {},
          'relationships': {
            'content': {
              'data': [
                {
                  'id': `${includedParagraph._id.toString()}`,
                  'type': 'paragraph'
                },
                {
                  'id': `${includedImage._id.toString()}`,
                  'type': 'image'
                }

              ]
            }
          }
        },
        'included': [
          {
            'type': 'paragraph',
            'attributes': {
              'content': []
            },
            'id': `${includedParagraph._id.toString()}`
          },
          {
            'type': 'image',
            'attributes': {
              'caption': 'Image underlying message'
            },
            'id': `${includedImage._id.toString()}`
          }
        ]
      })
    })
  })
})
