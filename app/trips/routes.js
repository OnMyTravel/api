'use strict'

var express = require('express')
var router = express.Router({mergeParams: true})

var middleware = require('./middleware')
var controller = require('./controller')
var isAuthenticated = require('../shared').isAuthenticated

// Routes
router.get('/:id', controller.getOne)
router.get('/', isAuthenticated, controller.getAll)
router.post('/', isAuthenticated, controller.create)
router.put('/:tripid', isAuthenticated, middleware.existsAndIsEditable, controller.updateOne)
router.delete('/:tripid', isAuthenticated, middleware.existsAndIsEditable, controller.deleteOne)

module.exports = router
