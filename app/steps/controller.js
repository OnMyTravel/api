var statusCode = require('http-status-codes')

function get (req, res) {
  res.setHeader('WWW-Authenticate', 'bearer')
  res.sendStatus(statusCode.UNAUTHORIZED)
}

module.exports = { get }
