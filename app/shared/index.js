const httpStatus = require('http-status-codes')
const config = require('config')
const jsonwebtoken = require('jsonwebtoken')

function isAuthenticated (request, response, next) {
  if (request.headers.authorization) {
    let token = getToken(request)
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

function create (id, facebook_token) {
  return jsonwebtoken.sign({
    id: id,
    facebook_access_token: facebook_token
  }, config.get('app-secret'))
}

function getToken (request) {
  return request.headers.authorization.substring('Bearer '.length)
}

function decode (token) {
  let decodedToken = jsonwebtoken.decode(token, config.get('app-secret'))
  delete decodedToken.iat
  return decodedToken
}

module.exports = { isAuthenticated, tokens: { getToken, decode, create } }
