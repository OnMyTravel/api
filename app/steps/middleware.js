const statusCode = require('http-status-codes')
const repository = require('./repository')

function exists (req, res, next) {
  return repository
    .findByTripIdAndStepId(req.params.tripid, req.params.stepid)
    .then((trip) => {
      if (trip) {
        next()
      } else {
        res.status(statusCode.NOT_FOUND).json()
      }
    })
}

function handleUploadError (err, req, res, next) {
  if (err) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json(err)
  } else {
    next()
  }
}

function fileExists (req, res, next) {
  return repository
    .findByTripIdStepIdAndImageId(req.params.tripid, req.params.stepid, req.params.imageid)
    .then((step) => {
      if (step != null) {
        next()
      } else {
        res.status(statusCode.NOT_FOUND).json()
      }
    })
}

module.exports = { exists, handleUploadError, fileExists }
