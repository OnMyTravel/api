const httpStatus = require('http-status-codes')
const { Trip, Day } = require('./../../models')
const { TripNotFound } = require('./../../shared/errors')

const TripSerializer = require('../../serializers/TripSerializer')

module.exports = (req, res) => {
  let trip
  return Trip
    .findById(req.params.id)
    .then((foundTrip) => {
      if (!foundTrip) {
        throw new TripNotFound({})
      }

      trip = foundTrip

      return Day.find({ trip: { id: trip._id } })
    })
    .then((days) => {
      return res.json(TripSerializer.serialize(trip, days))
    })
    .catch(() => {
      return res.status(httpStatus.NOT_FOUND).json()
    })
}
