const DaySerializer = require('../../serializers/DaySerializer')
const { Day } = require('../../models')

module.exports = (req, res) => {
  return Day.findById(req.params.day_id)
    .then((day) => {
      if (!day) {
        res.status(404).json()
      } else {
        res.status(200).json(DaySerializer.serialize(day))
      }
    })
    .catch(() => {
      res.status(500).json()
    })
}
