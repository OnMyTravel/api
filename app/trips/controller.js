const Trip = require('./model')
const httpStatus = require('http-status-codes')
const shared = require('../shared')

function create (req, res) {
  let token = shared.tokens.getToken(req)
  let decodedToken = shared.tokens.decode(token)

  let newTrip = new Trip(req.body)
  newTrip.owner_id = decodedToken.id
  let errors = newTrip.validateSync()

  if (!errors) {
    return newTrip.save().then((createdTrip) => {
      return res.status(httpStatus.CREATED).json(createdTrip)
    })
  } else {
    return res.status(httpStatus.BAD_REQUEST).json(shared.errors.format(errors))
  }
}

function getAll (req, res) {
  let token = shared.tokens.getToken(req)
  let decodedToken = shared.tokens.decode(token)

  return Trip.find({ owner_id: decodedToken.id }, (err, data) => {
    if (err) {
      return res.status(httpStatus.BAD_REQUEST).json()
    }

    res.json(data)
  })
}

module.exports = { create, getAll }
