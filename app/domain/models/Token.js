let mongoose = require('mongoose')
let Schema = mongoose.Schema

let TokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    key: String,
    creationDate: Date,
    expirationDate: Date
  },
  {
    versionKey: false
  }
)

module.exports = mongoose.model('Token', TokenSchema)