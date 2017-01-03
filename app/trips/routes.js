'use strict'

var express = require('express')
var router = express.Router({mergeParams: true})

var controller = require('./controller')
var shared = require('../shared')

// Routes
router.get('/:id', controller.getOne)
router.get('/', shared.isAuthenticated, controller.getAll)
router.post('/', shared.isAuthenticated, controller.create)

module.exports = router
