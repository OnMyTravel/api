let Trip = require('./model')
let httpStatus = require('http-status-codes')

function create (req, res) {
  if (!req.headers.hasOwnProperty('authorization')) {
    res.setHeader('WWW-Authenticate', 'bearer')
    res.sendStatus(httpStatus.UNAUTHORIZED)
    return res.send()
  }

  let newTrip = new Trip(req.body)
  let errors = newTrip.validateSync()

  if (!errors) {
    return newTrip.save().then((createdTrip) => {
      return res.status(httpStatus.CREATED).json(createdTrip)
    })
  } else {
    return res.status(httpStatus.BAD_REQUEST).json()
  }
}

function getAll (req, res) {
  if (!req.headers.hasOwnProperty('authorization')) {
    res.setHeader('WWW-Authenticate', 'bearer')
    res.sendStatus(httpStatus.UNAUTHORIZED).json()
  }
  res.json([])
}

module.exports = { create, getAll }
