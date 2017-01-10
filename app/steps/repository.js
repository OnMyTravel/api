const Step = require('./model')

function create (model) {
  return new Step(model).save()
}

function findByTripId (trip_id) {
  return Step.find({ trip_id })
}

module.exports = { create, findByTripId }
