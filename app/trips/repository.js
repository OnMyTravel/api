let Trip = require('./model')

function findById (id) {
  return Trip.findById(id).exec()
}

function findByOwnerId (ownerId) {
  return Trip.find({ owner_id: ownerId })
}

function create (model) {
  return new Trip(model).save()
}

function updateByIdAndOwnerId (_id, ownerId, model) {
  return Trip.update({ _id, owner_id: ownerId }, { $set: model }, {runValidators: true})
}

function deleteById (_id) {
  return Trip.findByIdAndRemove(_id)
}

module.exports = { findById, create, findByOwnerId, updateByIdAndOwnerId, deleteById }
