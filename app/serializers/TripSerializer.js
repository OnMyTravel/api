const { Deserializer, Serializer } = require('jsonapi-serializer')

const Types = require('../models/Types')

module.exports = {
  deserialize: (payload) => { },

  serialize: (trip, days = []) => {
    const tripInJson = trip.toJSON()
    tripInJson.days = days
    return new Serializer(Types.Trip, {
      attributes: ['description', 'name', 'days'],
      days: {
        ref: function (trip, day) {
          if (day) {
            return day._id.toJSON()
          }
        }
      },
      transform: function (trip) {
        trip.id = trip._id.toString()
        return trip
      }
    }).serialize(tripInJson)
  }
}
