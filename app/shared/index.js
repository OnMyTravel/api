const httpStatus = require('http-status-codes')
const config = require('config')
const jsonwebtoken = require('jsonwebtoken')

function isAuthenticated (request, response, next) {
  if (request.headers.authorization) {
    let token = request.headers.authorization.substring('Bearer '.length)
    try {
      jsonwebtoken.verify(token, config.get('app-secret'))
      next()
    } catch (e) {
      response.status(httpStatus.BAD_REQUEST).json({
        'error': {
          'name': e.name,
          'message': e.message
        }
      })
    }
  } else {
    response.status(httpStatus.UNAUTHORIZED).json({})
  }
}

module.exports = { isAuthenticated }
