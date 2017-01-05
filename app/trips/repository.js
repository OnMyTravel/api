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

function updateByIdAndOwnerId (_id, owner_id, model) {
  return Trip.update({ _id, owner_id }, { $set: model }, {runValidators: true})
}

module.exports = { findById, create, findByOwnerId, updateByIdAndOwnerId }
