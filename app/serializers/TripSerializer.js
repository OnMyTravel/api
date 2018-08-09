const { Deserializer, Serializer } = require('jsonapi-serializer')

const Types = require('../models/Types')

module.exports = {
  deserialize: (payload) => { },

  serialize: (trip, days = []) => {
    const tripInJson = trip.toJSON()
    tripInJson.days = days
    return new Serializer(Types.Trip, {
      attributes: ['description', 'name', 'days', 'destination', 'user'],
      days: {
        ref: function (trip, day) {
          if (day) {
            return day._id.toJSON()
          }
        }
      },
      user: {
        ref: function (trip) {
          return trip.owner_id.toString()
        }
      },
      transform: function (trip) {
        trip.id = trip._id.toString()
        trip.user = trip.owner_id
        return trip
      }
    }).serialize(tripInJson)
  }
}
