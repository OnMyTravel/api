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

module.exports = { exists }
