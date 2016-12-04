let Trip = require('./model')

function findById (id) {
  return Trip.findById(id).exec()
}

function create (model) {
  return new Trip(model).save()
}

module.exports = { findById, create }
