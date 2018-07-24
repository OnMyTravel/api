const DaySerializer = require('../../serializers/DaySerializer')
const { Trip } = require('../../models')
const { TripNotFound } = require('../../shared/errors')

module.exports = (req, res) => {
  let createdDay

  return DaySerializer.deserialize(req.body)
    .then(day => (createdDay = day))
    .then(_ => {
      return Trip.findById(createdDay.trip.id)
    })
    .then((trip) => {
      if (!trip) {
        throw new TripNotFound()
      }
    })
    .then(() => {
      const serializedDay = DaySerializer.serialize(createdDay)
      res.status(201).json(serializedDay)
    })
    .catch((err) => {
      if (err instanceof TripNotFound) {
        return res.status(404).json()
      }

      throw err
    })
}
