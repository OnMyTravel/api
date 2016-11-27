'use strict'

var express = require('express')
var router = express.Router({mergeParams: true})

var controller = require('./controller')

// Routes
router.post('/register/facebook', controller.registerFromFacebook)

module.exports = router
