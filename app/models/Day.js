const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Types = require('./Types')

const DaySchema = new Schema(
  {
    trip: { id: { type: mongoose.Schema.Types.ObjectId, ref: Types.Trip, required: true } },
    type: { type: String, default: Types.Day },
    content: [Schema.Types.Mixed]
  }
)

module.exports = DaySchema
