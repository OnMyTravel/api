let mongoose = require('mongoose')
let Schema = mongoose.Schema

let TripSchema = new Schema(
  {
    name: { type: String, required: true },
    owner_id: { type: Schema.Types.ObjectId, required: true },
    description: String,
    destination: String
  },
  {
    versionKey: false
  }
)

module.exports = mongoose.model('Trip', TripSchema)
