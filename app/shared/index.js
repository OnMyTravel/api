const httpStatus = require('http-status-codes')
const config = require('config')
const jsonwebtoken = require('jsonwebtoken')

const images = require('./images')
const tokens = require('./tokens')
const containers = require('./containers')
const classErrors = require('./errors')

function isAuthenticated (request, response, next) {
  if (request.headers.authorization) {
    let token = tokens.getToken(request)
    try {
      jsonwebtoken.verify(token, config.get('app-secret'))
      next()
    } catch (e) {
      response.setHeader('WWW-Authenticate', 'bearer')
      response.status(httpStatus.BAD_REQUEST).json({
        'error': {
          'name': e.name,
          'message': e.message
        }
      })
    }
  } else {
    response.status(httpStatus.UNAUTHORIZED)
    response.setHeader('WWW-Authenticate', 'bearer')
    response.json()
  }
}

function format (mongooseError) {
  for (let property in mongooseError.errors) {
    let propertyField = mongooseError.errors[property]
    delete propertyField.name
    delete propertyField.path
    delete propertyField.properties
  }

  return mongooseError
}

module.exports = {
  isAuthenticated,
  tokens,
  errors: { format, classes: classErrors },
  images,
  containers
}
