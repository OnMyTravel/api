const httpStatus = require('http-status-codes')
const facebookClient = require('./facebook')
const User = require('./model')
const shared = require('../shared')

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
      res.status(httpStatus.UNAUTHORIZED).json(JSON.parse(error))
    })
}

function me (req, res) {
  let token = shared.tokens.getToken(req)
  let decodedToken = shared.tokens.decode(token)

  User.findById(decodedToken.id)
    .then((user) => {
      res.status(httpStatus.OK).json(user.toJSON())
    })
}

module.exports = { registerFromFacebook, me }
