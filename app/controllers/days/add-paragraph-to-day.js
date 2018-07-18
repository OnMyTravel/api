const ParagraphSerializer = require('../../serializers/ParagraphSerializer')
const { Day } = require('../../models')

module.exports = (req, res) => {
  let deserializedParagraph

  return ParagraphSerializer.deserialize(req.body)
    .then((paragraph) => {
      deserializedParagraph = paragraph

      return Day.findById(req.params.day_id)
    })
    .then((day) => {
      day.content.push(deserializedParagraph)
      return day.save()
    })
    .then(() => {
      return ParagraphSerializer.serialize(deserializedParagraph)
    })
    .then((paragraph) => {
      res.status(201).json(paragraph)
    })
    .catch(() => {
      res.status(500).json()
    })
}
