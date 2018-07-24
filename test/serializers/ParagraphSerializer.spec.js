const expect = require('chai').expect
const Faker = require('faker')

const ParagraphSerializer = require('../../app/serializers/ParagraphSerializer')

const { Paragraph } = require('../../app/models/index')

describe('Unit | Serializer | Paragraph', () => {
  describe('deserialize', () => {
    it('should transform a JSONApi element into', () => {
      // given
      const paragraphInJSON = {
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
      }

      // when
      const promise = ParagraphSerializer.deserialize(paragraphInJSON)

      // then
      return promise.then((deserializedParagraph) => {
        expect(deserializedParagraph).to.be.an.instanceof(Paragraph)
      })
    })
  })
})
