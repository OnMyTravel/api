const httpStatus = require('http-status-codes')
const config = require('config')
const jsonwebtoken = require('jsonwebtoken')

const images = require('./images')

function isAuthenticated (request, response, next) {
  if (request.headers.authorization) {
    let token = getToken(request)
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

function create (user_id, facebook_token) {
  return jsonwebtoken.sign({
    id: user_id,
    facebook_access_token: facebook_token
  }, config.get('app-secret'), { expiresIn: '1h' })
}

function getToken (request) {
  return request.headers.authorization.substring('Bearer '.length)
}

function decode (token) {
  let decodedToken = jsonwebtoken.decode(token, config.get('app-secret'))
  delete decodedToken.iat
  return decodedToken
}

module.exports = { isAuthenticated,
  tokens: { getToken, decode, create },
  errors: { format },
  images
}
