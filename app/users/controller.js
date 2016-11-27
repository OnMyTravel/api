const httpStatus = require('http-status-codes')
const jsonwebtoken = require('jsonwebtoken')
const facebookClient = require('./facebook')
const User = require('./model')
const shared = require('../shared')
const config = require('config')

function registerFromFacebook (req, res) {
  if (!req.body.access_token) {
    return res.status(httpStatus.BAD_REQUEST).json({
      'error': {
        'name': 'MissingParameter',
        'message': 'access_token must be provided'
      }
    })
  }

  return facebookClient
    .getUserDetails(req.body.access_token)
    .then((data, response) => {
      User.findOne({ id_facebook: data.id })
        .then((foundUser) => {
          if (foundUser) {
            let token = shared.tokens.create(foundUser._id, req.body.access_token)
            res.status(httpStatus.OK).json({ token })
          } else {
            new User({
              name: data.name,
              email: data.email,
              id_facebook: data.id
            }).save()
            .then((created) => {
              let token = shared.tokens.create(created._id, req.body.access_token)
              res.status(httpStatus.CREATED).json({ token })
            })
          }
        })
    }, (error) => {
      res.status(httpStatus.UNAUTHORIZED).json(error)
    })
}

module.exports = { registerFromFacebook }
