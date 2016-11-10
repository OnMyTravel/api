var express = require('express')
var app = express()

var pjson = require('../package.json')

app.get('/', function (req, res) {
  res.json({ description: pjson.description, version: pjson.version })
})

module.exports = app
