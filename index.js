var express = require('express')
var app = express()

var pjson = require('./package.json')

app.get('/', function (req, res) {
  res.json({ description: pjson.description, version: pjson.version })
})

app.listen(3000, function () {
  console.log(pjson.name + ': running on port 3000')
})
