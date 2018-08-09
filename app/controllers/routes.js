'use strict'

const crypto = require('crypto')
const mime = require('mime-types')

const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (_, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    })
  }
})

const express = require('express')
const router = express.Router({ mergeParams: true })
const upload = multer({ storage })

const {
  createNewDay,
  getDayById,
  addParagraphToDay,
  getTripById,
  addImageToDay,
  getImageById
} = require('./controllers')

router.get('/days/:day_id', getDayById)
router.get('/trips/:id', getTripById)
router.post('/days', createNewDay)
router.post('/days/:day_id/paragraphs', addParagraphToDay)
router.post('/days/:day_id/images', upload.single('image'), addImageToDay)
// router.get('/image/:image_id', getImageById)

// router.get('/', (req, res) => {
//   console.log('ICI ======================================================================================')
//   const day = new Day()
//   day
//     .save()
//     .then((savedDay) => {
//       console.log(savedDay)

//       const firstText = new Paragraph({ content: ['First block on Paragraph ONE', 'Second block on Paragraph ONE'] })
//       const secondText = new Paragraph({ content: ['First block on Paragraph TWO', 'Second block on Paragraph TWO'] })
//       // const image = new Image({ caption: 'Sous titre / Legend' })
//       day.content.push(secondText)
//       day.content.unshift(firstText)
//       // day.content.unshift(image)
//       day.save()
//         .then((savedDay) => {
//           console.log(savedDay)
//         })
//     })

//   Day.find({ _id: '5b4462a758ad170eee449c17' })
//     .then((days) => {
//       console.log(days[0])
//       // console.log(days[0] instanceof Day)
//       // console.log(days[0].content[0] instanceof Image)
//       console.log(days[0].content[0] instanceof Paragraph)
//       console.log(new Paragraph(days[0].content[0]).toObject({ virtuals: true }))
//       // console.log(days[0].content[0])

//       res.json(days[0].toObject({ virtuals: true }))
//     })
// })

module.exports = router
