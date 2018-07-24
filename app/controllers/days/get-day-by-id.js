const DaySerializer = require('../../serializers/DaySerializer')
const { Day } = require('../../models')

module.exports = (req, res, next) => {
  return Day.findById(req.params.day_id)
    .then((day) => {
      if (!day) {
        res.status(404).json()
      } else {
        const serializedDay = DaySerializer.serialize(day)
        res.status(200).json(serializedDay)
      }
    })
    .catch(next)
}
