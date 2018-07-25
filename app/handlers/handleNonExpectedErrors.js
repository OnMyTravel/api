const JSONAPIError = require('jsonapi-serializer').Error

module.exports = function (error, req, res, next) {
  const jsonAPIerror = new JSONAPIError({
    code: '500',
    title: 'Value is too short',
    detail: error.message
  })

  res.status(500).json(jsonAPIerror)
}
