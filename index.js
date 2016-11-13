var mongoose = require('mongoose')

var pjson = require('./package.json')
var api = require('./app')

var config = require('./config')

mongoose.connect(config.db)

module.exports = api.listen(config.app.port, function () {
  console.log(pjson.name + ': running on port ' + config.app.port)
})
