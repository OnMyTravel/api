const DaySerializer = require('../../serializers/DaySerializer')
const { Trip } = require('../../models')
const { TripNotFound } = require('../../shared/errors')

module.exports = (req, res) => {
  let day

  return DaySerializer.deserialize(req.body)
    .then(deserializedDay => (day = deserializedDay))
    .then(_ => {
      return Trip.findById(day.trip.id)
    })
    .then((trip) => {
      if (!trip) {
        return Promise.reject(new TripNotFound())
      }

      console.log(day)
      return day.save()
    })
    .then((savedDay) => {
      const serializedDay = DaySerializer.serialize(savedDay)
      res.status(201).json(serializedDay)
    })
    .catch((err) => {
      if (err instanceof TripNotFound) {
        return res.status(404).json()
      }

      console.log(err)
      return res.status(500).json(err)
    })
}
