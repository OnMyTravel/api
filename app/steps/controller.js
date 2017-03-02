const fs = require('fs')
const shared = require('../shared')
const errors = shared.errors.classes
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
    let imageDetails = {
      path: req.file.path,
      mime: req.file.mime,
      name: req.file.filename
    }

    let imageInformationsToSave = {
      caption: req.body.caption,
      size: req.file.size,
      source: req.file.filename
    }

    return shared.images.getCoordinates(req.file.path)
      .then((coordinates) => {
        imageInformationsToSave.gps = coordinates
        return shared.containers.uploadToStorage(imageDetails, req.params.tripid)
      })
      .then((image) => {
        return repository.addImageToGallery(req.params.stepid, imageInformationsToSave)
      })
      .then((step) => {
        fs.unlinkSync(req.file.path)
        res.status(statusCode.CREATED).json(step)
      })
      .catch((error) => {
        if (error instanceof errors.GPSError) {
          res.status(statusCode.UNPROCESSABLE_ENTITY).json()
        } else if (error instanceof errors.ContainerError) {
          res.status(statusCode.INTERNAL_SERVER_ERROR).json()
        } else {
          // FIXME: We should deal with that
          //console.log(error)
        }
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
    .updateByTripIdAndStepId(req.params.stepid, stepChanges)
    .then((step) => {
      res.json(step)
    })
}

module.exports = { get, create, deleteOne, updateOne, attach }
