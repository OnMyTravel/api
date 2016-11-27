'use strict'

var express = require('express')
var router = express.Router({mergeParams: true})
var shared = require('../shared')

var controller = require('./controller')

// Routes
router.post('/register/facebook', controller.registerFromFacebook)
router.get('/me', shared.isAuthenticated, controller.me)

module.exports = router
