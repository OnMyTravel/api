const development = require('./env/development')
const test = require('./env/test')
const production = require('./env/production')

module.exports = { development, test, production }[ process.env.NODE_ENV || 'development' ]
