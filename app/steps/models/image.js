let mongoose = require('mongoose')
let Schema = mongoose.Schema

let GPSSchema = new Schema(
  {
    GPSLatitudeRef: String,
    GPSLatitude: [ Number ],
    GPSLongitudeRef: String,
    GPSLongitude: [ Number ],
    GPSAltitudeRef: Number,
    GPSAltitude: Number
  },
  {
    versionKey: false
  }
)

let ImageSchema = new Schema(
  {
    source: { type: String, required: true },
    gps: GPSSchema,
    caption: String,
    size: Number
  },
  {
    versionKey: false
  }
)

module.exports = mongoose.model('Image', ImageSchema)
