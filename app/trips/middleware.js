const statusCode = require('http-status-codes')
const tripRepository = require('./repository')
const shared = require('../shared')

function exists (req, res, next) {
  return tripRepository
    .findById(req.params.tripid)
    .then((trip) => {
      if (trip) {
        next()
      } else {
        res.status(statusCode.NOT_FOUND).json()
      }
    })
}

function existsAndIsEditable (req, res, next) {
  let token = shared.tokens.getToken(req)
  let decodedToken = shared.tokens.decode(token)
  return tripRepository
    .findById(req.params.tripid)
    .then((trip) => {
      if (trip) {
        if (decodedToken.id.toString() === trip.owner_id.toString()) {
          next()
        } else {
          res.status(statusCode.FORBIDDEN).json()
        }
      } else {
        res.status(statusCode.NOT_FOUND).json()
      }
    })
}

module.exports = { exists, existsAndIsEditable }
