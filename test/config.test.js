// XXX: Here is a little trick to force Mongoose to reset the compiled models
const mongoose = require('mongoose')
mongoose.models = {}
mongoose.modelSchemas = {}
