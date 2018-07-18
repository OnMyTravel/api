const { Deserializer, Serializer } = require('jsonapi-serializer')

const { Paragraph } = require('../models')
const Types = require('../models/Types')

module.exports = {
  deserialize: (payload) => {
    return new Deserializer({
      trips: {
        valueForRelationship: function (relationship) {
          return {
            id: relationship.id
          }
        }
      }
    })
      .deserialize(payload)
      .then((parsedContent) => {
        return new Paragraph(parsedContent)
      })
  },

  serialize: (day) => {
    console.log(day)
    return new Serializer(Types.Paragraph, {
      attributes: ['content']
    }).serialize(day)
  }
}
