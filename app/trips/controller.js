const tripRepository = require('./repository')
const httpStatus = require('http-status-codes')
const shared = require('../shared')

function create (req, res) {
  let token = shared.tokens.getToken(req)
  let decodedToken = shared.tokens.decode(token)

  let newTripPayload = req.body
  newTripPayload.owner_id = decodedToken.id

  tripRepository
    .create(newTripPayload)
    .then((createdTrip) => {
      return res.status(httpStatus.CREATED).json(createdTrip)
    }, (errors) => {
      return res.status(httpStatus.BAD_REQUEST).json(shared.errors.format(errors))
    })
}

function getAll (req, res) {
  let token = shared.tokens.getToken(req)
  let decodedToken = shared.tokens.decode(token)

  tripRepository
    .findByOwnerId(decodedToken.id)
    .then((trip) => {
      res.json(trip)
    }, () => {
      return res.status(httpStatus.BAD_REQUEST).json()
    })
}

module.exports = { create, getAll }
