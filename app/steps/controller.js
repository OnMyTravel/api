const statusCode = require('http-status-codes')
const repository = require('./repository')

function get (req, res) {
  return repository
    .findByTripId(req.params.tripid)
    .then((trips) => {
      res.status(statusCode.OK).json(trips)
    })
}

function create (req, res) {
  let stepPayload = req.body
  stepPayload.trip_id = req.params.tripid

  stepPayload.gallery = []

  return repository
    .create(stepPayload)
    .then((step) => {
      res.status(statusCode.OK).json(step)
    }, (error) => {
      res.status(statusCode.BAD_REQUEST).json(error)
    })
}

function deleteOne (req, res) {
  repository
    .deleteById(req.params.stepid)
    .then(() => {
      res.status(200).json()
    })
}

function attach (req, res) {
  if (req.file) {
    let image = {
      source: req.file.filename,
      caption: req.body.caption,
      size: req.file.size
    }

    repository
      .addImageToGallery(req.params.stepid, image)
      .then((step) => {
        res.status(statusCode.OK).json(step)
      })
  } else {
    res.status(statusCode.BAD_REQUEST).json()
  }
}

function updateOne (req, res) {
  let stepChanges = req.body
  stepChanges.trip_id = req.params.tripid
  delete stepChanges.gallery

  repository
    .updateByTripIdAndStepId(req.params.tripid, req.params.stepid, stepChanges)
    .then((step) => {
      res.json(step)
    })
}

module.exports = { get, create, deleteOne, updateOne, attach }
