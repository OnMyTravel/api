var bodyParser = require('body-parser')
var express = require('express')
var app = express()
app.use(bodyParser.json())

var pjson = require('../package.json')

app.use('/steps', require('./steps/routes'))
app.use('/trips', require('./trips/routes'))

app.get('/', function (req, res) {
  res.json({ description: pjson.description, version: pjson.version })
})

module.exports = app
