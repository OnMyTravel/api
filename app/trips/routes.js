'use strict'

var express = require('express')
var router = express.Router({mergeParams: true})

var controller = require('./controller')
var shared = require('../shared')

// Routes
router.get('/:id', controller.getOne)
router.get('/', shared.isAuthenticated, controller.getAll)
router.post('/', shared.isAuthenticated, controller.create)
router.put('/:id', shared.isAuthenticated, controller.updateOne)
router.delete('/:id', shared.isAuthenticated, controller.deleteOne)

module.exports = router
