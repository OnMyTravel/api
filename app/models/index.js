const mongoose = require('mongoose')

const Types = require('./Types')

const DaySchema = require('./Day')
const ParagraphSchema = require('./Paragraph')
const Image = require('./Image')
const Trip = require('./Trip')

module.exports = {
  'Day': mongoose.model(Types.Day, DaySchema),
  'Paragraph': mongoose.model(Types.Paragraph, ParagraphSchema),
  'Image': mongoose.model(Types.Image, Image),
  'Trip': mongoose.model(Types.Trip, Trip)
}
