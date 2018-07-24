const ParagraphSerializer = require('../../serializers/ParagraphSerializer')
const { Day } = require('../../models')
const { DayNotFound } = require('./../../shared/errors')

module.exports = (req, res, next) => {
  let deserializedParagraph

  return ParagraphSerializer.deserialize(req.body)
    .then((paragraph) => {
      deserializedParagraph = paragraph

      return Day.findById(req.params.day_id)
    })
    .then((day) => {
      if (!day) {
        throw new DayNotFound({})
      }

      day.content.push(deserializedParagraph)
      return day.save()
    })
    .then(() => {
      return ParagraphSerializer.serialize(deserializedParagraph)
    })
    .then((paragraph) => {
      res.status(201).json(paragraph)
    })
    .catch((err) => {
      if (err instanceof DayNotFound) {
        return res.status(404).json()
      }

      throw err
    })
    .catch(next)
}
