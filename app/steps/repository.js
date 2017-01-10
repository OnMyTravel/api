const Step = require('./model')

function create (model) {
  return new Step(model).save()
}

function findByTripId (trip_id) {
  return Step.find({ trip_id })
}

function findByTripIdAndStepId (trip_id, step_id) {
  return Step.find({ trip_id, _id: step_id })
}

module.exports = { create, findByTripId, findByTripIdAndStepId }
