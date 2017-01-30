const tripRepository = require('./repository')
const stepRepository = require('../steps/repository')
const httpStatus = require('http-status-codes')
const shared = require('../shared')

function create (req, res) {
  let token = shared.tokens.getToken(req)
  let decodedToken = shared.tokens.decode(token)

  let newTripPayload = req.body
  newTripPayload.owner_id = decodedToken.id

  return tripRepository
    .create(newTripPayload)
    .then((createdTrip) => {
      shared.containers
        .create(createdTrip._id)
        .then(() => {
          return res.status(httpStatus.CREATED).json(createdTrip)
        }, () => {
          return res.status(httpStatus.BAD_GATEWAY).json()
        })
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

function getOne (req, res) {
  return tripRepository
    .findById(req.params.id)
    .then((trip) => {
      if (trip) {
        return res.json(trip)
      }

      return res.status(httpStatus.NOT_FOUND).json()
    })
}

function updateOne (req, res) {
  let token = shared.tokens.getToken(req)
  let decodedToken = shared.tokens.decode(token)

  return tripRepository
    .updateByIdAndOwnerId(req.params.tripid, decodedToken.id, req.body)
    .then((updateResult) => {
      res.status(httpStatus.OK).json()
    }, (err) => {
      res.status(httpStatus.BAD_REQUEST).json(shared.errors.format(err))
    })
}

function deleteOne (req, res) {
  return tripRepository
    .deleteById(req.params.tripid)
    .then(() => {
      stepRepository
        .deleteByTripId(req.params.tripid)
        .then(() => {
          res.status(httpStatus.OK).json()
        }, () => {
          res.status(httpStatus.INTERNAL_SERVER_ERROR).json()
        })
    }, () => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json()
    })
}

module.exports = { create, getAll, getOne, updateOne, deleteOne }
