const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const morgan = require('morgan')

const app = express()

app.use(cors())
app.use(bodyParser.json())

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'))
}

const pjson = require('../package.json')

app.use('/trips', require('./trips/routes'))
app.use('/trips/:tripid/steps', require('./steps/routes'))
app.use('/users', require('./users/routes'))

app.get('/', function (req, res) {
  res.json({ description: pjson.description, version: pjson.version })
})

module.exports = app
