let Trip = require('./model')
let httpStatus = require('http-status-codes')

function create (req, res) {
  var newTrip = new Trip({ name: 'GDIU' })
  newTrip.save((err, trip) => {
    if (err) {
      res.send(err)
    } else {
      res.json({ trip })
    }
  })
}

function getAll (req, res) {
  if(!req.headers.hasOwnProperty('authorization')) {
    res.setHeader('WWW-Authenticate', 'bearer')
    res.sendStatus(httpStatus.UNAUTHORIZED).send()
  }
  res.send([])
}

module.exports = { create, getAll }
