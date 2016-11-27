let httpStatus = require('http-status-codes')
let jsonwebtoken = require('jsonwebtoken')
let facebookClient = require('./facebook')
let User = require('./model')

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
          var token = jsonwebtoken.sign({
            id_facebook: data.id,
            facebook_access_token: req.body.access_token
          }, 'supersecret')

          if (foundUser) {
            res.status(httpStatus.OK).json({ token: token })
          } else {
            new User({
              name: data.name,
              email: data.email,
              id_facebook: data.id
            }).save()
            .then((created) => {
              res.status(httpStatus.CREATED).json({ token: token })
            })
          }
        })
    }, (error) => {
      res.status(httpStatus.UNAUTHORIZED).json(error)
    })
}

module.exports = { registerFromFacebook }
