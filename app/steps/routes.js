'use strict'

const express = require('express')
const router = express.Router({mergeParams: true})

const controller = require('./controller')
const isAuthenticated = require('../shared').isAuthenticated
const step = require('./middleware')
const trip = require('../trips/middleware')

// Routes
router.get('/', trip.exists, controller.get)
router.post('/', isAuthenticated, trip.existsAndIsEditable, controller.create)
router.delete('/:stepid', isAuthenticated, trip.existsAndIsEditable, step.exists, controller.deleteOne)
router.put('/:stepid', isAuthenticated, trip.existsAndIsEditable, step.exists, controller.updateOne)

module.exports = router
