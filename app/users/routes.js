'use strict'

const express = require('express')
const router = express.Router({mergeParams: true})
const shared = require('../shared')

const controller = require('./controller')
const newController = require('../application/controllers/users')

// Routes
router.post('/register/facebook', controller.registerFromFacebook)
router.get('/me', shared.isAuthenticated, controller.me)
router.post('/register/webapp', newController.authenticateWithCredentials)

module.exports = router
