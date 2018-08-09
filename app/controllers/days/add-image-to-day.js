const { Day, Image } = require('../../models')
const { DayNotFound } = require('./../../shared/errors')

const mime = require('mime-types')
const _ = require('lodash')

module.exports = (req, res, next) => {
  return Day.findById(req.params.day_id)
    .then((day) => {
      if (!day) {
        throw new DayNotFound({})
      }

      return day
    })
    .then((day) => {
      if(!req.file)
        return res.status(400).json()

      day.content.push(new Image({
        caption: req.body.caption,
        path: `${req.file.filename}.${mime.extension(req.file.mimetype)}`,
        gps: _.omit(req.body, 'caption')
      }))

      return day.save()
    })
    .then(() => {
      res.status(201).json()
    })
    .catch((err) => {
      if (err instanceof DayNotFound) {
        return res.status(404).json()
      }

      throw err
    })
    .catch(next)
} 
