'use strict'

const express = require('express')
const router = express.Router({mergeParams: true})

const controller = require('./controller')
const shared = require('../shared')
const tripMiddleware = require('../trips/middleware')

// Routes
router.get('/', tripMiddleware.exists, controller.get)
router.post('/', shared.isAuthenticated, tripMiddleware.existsAndIsEditable, controller.create)

module.exports = router
