const development = require('./env/development')
const test = require('./env/test')
const production = require('./env/production')

var defaults = {
  app: {
    port: 3000
  }
}

const extend = require('util')._extend

module.exports = {
  development: Object.assign({}, defaults, development),
  test: Object.assign({}, defaults, test),
  production: Object.assign({}, defaults, production) }[ process.env.NODE_ENV || 'development' ]
