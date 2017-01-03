let Trip = require('./model')

function findById (id) {
  return Trip.findById(id).exec()
}

function findByOwnerId (owner_id) {
  return Trip.find({ owner_id })
}

function create (model) {
  return new Trip(model).save()
}

module.exports = { findById, create, findByOwnerId }
