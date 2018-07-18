let mongoose = require('mongoose')
let Schema = mongoose.Schema

const Types = require('./Types')

let Paragraph = new Schema(
  {
    type: { type: String, default: Types.Paragraph },
    content: [String]
  }
)

module.exports = Paragraph
