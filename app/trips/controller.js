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
  return tripRepository
    .findById(req.params.id)
    .then((trip) => {
      if (trip) {
        let token = shared.tokens.getToken(req)
        let decodedToken = shared.tokens.decode(token)

        if (trip.owner_id.toString() === decodedToken.id) {
          tripRepository
            .updateByIdAndOwnerId(trip._id, trip.owner_id, req.body)
            .then((updateResult) => {
              res.status(httpStatus.OK).json()
            }, (err) => {
              res.status(httpStatus.BAD_REQUEST).json(shared.errors.format(err))
            })
        } else {
          res.status(httpStatus.FORBIDDEN).json()
        }
      } else {
        res.status(httpStatus.NOT_FOUND).json()
      }
    })
}

module.exports = { create, getAll, getOne, updateOne }
