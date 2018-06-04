'use strict'

const express = require('express')
const router = express.Router({mergeParams: true})

const controller = require('./controller')
const isAuthenticated = require('../shared').isAuthenticated
const step = require('./middleware')
const trip = require('../trips/middleware')
const upload = require('multer')({ dest: 'uploads/' })

// Routes
router.get('/', trip.exists, controller.get)  
router.post('/', isAuthenticated, trip.existsAndIsEditable, controller.create)
router.post('/:stepid/attach', isAuthenticated, trip.existsAndIsEditable, step.exists,
  upload.single('picture'), step.handleUploadError, controller.attach)
router.delete('/:stepid', isAuthenticated, trip.existsAndIsEditable, step.exists, controller.deleteOne)
router.put('/:stepid', isAuthenticated, trip.existsAndIsEditable, step.exists, controller.updateOne)

router.get('/:stepid/images/:imageid', step.fileExists, controller.getImage)

module.exports = router
