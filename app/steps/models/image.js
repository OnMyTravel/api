let mongoose = require('mongoose')
let Schema = mongoose.Schema

let ImageSchema = new Schema(
  {
    source: { type: String, required: true },
    caption: String,
    size: Number
  },
  {
    versionKey: false
  }
)

module.exports = mongoose.model('Image', ImageSchema)
