const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Types = require('./Types')

const Image = new Schema(
  {
    type: { type: String, default: Types.Image },
    caption: String
  }
)

module.exports = Image
