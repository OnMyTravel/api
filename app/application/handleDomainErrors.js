const domainErrorsSerializer = require('./serializers/domainErrorsSerializer')
const DomainError = require('../domain/DomainError')

module.exports = function (error, req, res, next) {
  if(error instanceof DomainError) {
    const serializedError = domainErrorsSerializer(error)

    return res.status(400).json(serializedError)
  }

  next(error)
}
