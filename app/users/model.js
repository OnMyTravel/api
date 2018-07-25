let mongoose = require('mongoose')
let Schema = mongoose.Schema

let UserSchema = new Schema(
  {
    name: String,
    email: {
      type: String,
      required: false
    },
    id_facebook: {
      type: String
    }
  },
  {
    versionKey: false
  }
)

module.exports = mongoose.model('User', UserSchema)
