'use strict'

var express = require('express')
var router = express.Router({mergeParams: true})

var controller = require('./controller')

// Routes
router.get('/', controller.get)

module.exports = router
