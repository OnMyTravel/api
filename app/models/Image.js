const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Types = require('./Types')

let GPSSchema = new Schema(
  {
    GPSLatitudeRef: String,
    GPSLatitude: Number,
    GPSLongitudeRef: String,
    GPSLongitude: Number,
    GPSAltitudeRef: Number,
    GPSAltitude: Number
  },
  {
    versionKey: false
  }
)

const Image = new Schema(
  {
    type: { type: String, default: Types.Image },
    caption: { type: String, default: '' },
    path: { type: String, required: true },
    gps: GPSSchema
  }
)

module.exports = Image
