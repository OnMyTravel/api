let mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

let config = require('config')

let pjson = require('./package.json')
let api = require('./app')

mongoose.connect(config.database.host)
let db = mongoose.connection
db.on('error', console.error.bind(console, 'Database error:'))

api.listen(config.app.port, function () {
  console.log(pjson.name + ': running on port ' + config.app.port)
})

module.exports = api
