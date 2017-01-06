let mongoose = require('mongoose')
let Schema = mongoose.Schema

let StepSchema = new Schema(
  {
    message: String,
    image: {
      source: String,
      caption: String
    },
    location: {
      label: String,
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
      }
    },
    creation_date: { type: Date, default: Date.now },
    trip_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true }
  },
  {
    versionKey: false
  }
)

module.exports = mongoose.model('Step', StepSchema)
