const Step = require('./models/step')

function create (model) {
  return new Step(model).save()
}

function findByTripId (tripId) {
  return Step.find({ trip_id: tripId })
}

function findByTripIdAndStepId (tripId, stepId) {
  return Step.findOne({ trip_id: tripId, _id: stepId })
}

function findByTripIdStepIdAndImageId (tripId, stepId, imageSource) {
  return Step.findOne({ trip_id: tripId, _id: stepId, 'gallery.source': imageSource })
}

function deleteById (id) {
  return Step.findByIdAndRemove(id)
}

function updateByTripIdAndStepId (stepId, model) {
  return Step.findByIdAndUpdate(stepId, { $set: model }, {runValidators: true, new: true})
}

function deleteByTripId (tripId) {
  return Step.deleteMany({ trip_id: tripId })
}

function addImageToGallery (stepId, imageModel) {
  return Step
    .findOne({ _id: stepId })
    .then((step) => {
      step.gallery.push(imageModel)
      return step.save()
    })
}

module.exports = { create, findByTripId, findByTripIdAndStepId, updateByTripIdAndStepId, deleteById, deleteByTripId, addImageToGallery, findByTripIdStepIdAndImageId }
