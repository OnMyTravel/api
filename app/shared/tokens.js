const config = require('config')
const jsonwebtoken = require('jsonwebtoken')

function create (userId, facebookToken) {
  return jsonwebtoken.sign({
    id: userId,
    facebook_access_token: facebookToken
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

module.exports = { create, getToken, decode }
