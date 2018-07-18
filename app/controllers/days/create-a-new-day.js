const DaySerializer = require('../../serializers/DaySerializer')

module.exports = (req, res) => {
  return DaySerializer.deserialize(req.body)
    .then(day => {
      return day.save()
    })
    .then((savedDay) => {
      const serializedDay = DaySerializer.serialize(savedDay)
      res.status(201).json(serializedDay)
    })
    .catch((err) => {
      res.status(500).json(err)
    })
}
