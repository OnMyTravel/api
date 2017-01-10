const statusCode = require('http-status-codes')
const repository = require('./repository')

function get (req, res) {
  return repository
    .findByTripId(req.params.tripid)
    .then((trips) => {
      res.status(statusCode.OK).json(trips)
    })
}

function create (req, res) {
  let stepPayload = req.body
  stepPayload.trip_id = req.params.tripid

  return repository
    .create(stepPayload)
    .then((step) => {
      res.status(statusCode.OK).json(step)
    }, (error) => {
      res.status(statusCode.BAD_REQUEST).json(error)
    })
}

module.exports = { get, create }
