'use strict'

var express = require('express')
var router = express.Router({mergeParams: true})

var middleware = require('./middleware')
var controller = require('./controller')
var shared = require('../shared')

// Routes
router.get('/:id', controller.getOne)
router.get('/', shared.isAuthenticated, controller.getAll)
router.post('/', shared.isAuthenticated, controller.create)
router.put('/:tripid', shared.isAuthenticated, middleware.existsAndIsEditable, controller.updateOne)
router.delete('/:tripid', shared.isAuthenticated, middleware.existsAndIsEditable, controller.deleteOne)

module.exports = router
