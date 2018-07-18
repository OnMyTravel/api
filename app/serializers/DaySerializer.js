const { Deserializer, Serializer } = require('jsonapi-serializer')

const { Day } = require('../models')
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
        return new Day(parsedContent)
      })
  },

  serialize: (day) => {
    return new Serializer(Types.Day, {
      attributes: ['content'],
      typeForAttribute: function (attribute, record) {
        return record.type
      },
      content: {
        ref: function (day, content) {
          return content._id.toString()
        },
        attributes: ['content', 'caption']
      }
    }).serialize(day)
  }
}
