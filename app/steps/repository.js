const Step = require('./models/step')

function create (model) {
  return new Step(model).save()
}

function findByTripId (trip_id) {
  return Step.find({ trip_id })
}

function findByTripIdAndStepId (trip_id, step_id) {
  return Step.findOne({ trip_id, _id: step_id })
}

function deleteById (id) {
  return Step.findByIdAndRemove(id)
}

function updateByTripIdAndStepId (trip_id, step_id, model) {
  return Step.update({ _id: step_id, trip_id }, { $set: model }, {runValidators: true})
}

function deleteByTripId (trip_id) {
  return Step.remove({ trip_id })
}

function addImageToGallery (step_id, imageModel) {
  return Step
    .findOne({ _id: step_id })
    .then((step) => {
      step.gallery.push(imageModel)
      return step.save()
    })
}

module.exports = { create, findByTripId, findByTripIdAndStepId, updateByTripIdAndStepId, deleteById, deleteByTripId, addImageToGallery }
