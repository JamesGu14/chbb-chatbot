'use strict'

const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()
const textSemanticService = require('../services/aiui/textSementic')
const audioSemanticService = require('../services/aiui/audioSementic')
const ttsService = require('../services/aiui/tts')
const logQuery = require('../services/logService').logQuery
const parseResp = require('../services/funcs/').parseResp
const multer = require('multer')
const upload = multer({
  dest: 'public/audio/query'
})
const utility = require('../utility/utility')

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', {
    title: 'Express'
  })
})

router.get('/textSementic', function (req, res) {

  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  let query = req.query.q

  textSemanticService(query).then((data) => {

    // Process resp
    let resp = JSON.parse(data).data

    parseResp(resp).then((answer) => {

        logQuery(query, ip, true).then(() => {

          res.json(answer)
        })
      })
      .catch((err) => {

        logQuery(query, ip, false).then(() => {

          res.send(err)
        })
      })
  }).catch((err) => {
    logQuery(query, ip, false)
    return res.json({
      'error': err
    })
  })
})

router.post('/audioSementic', upload.single('file'), function (req, res) {

  let mimeType = req.file.mimetype
  if (!mimeType.startsWith('audio')) {
    return res.send('不是Audio文件')
  }

  let maxSize = 1 * 1000 * 1000 // 300kb max
  if (req.file.size > maxSize) {
    return res.send('上传失败，文件超过1MB')
  }

  // let filename = req.file.filename
  let filepath = req.file.path
  let originalName = req.file.originalname
  let postfix = originalName.split('.')[1]
  let newPath = `${filepath}.${postfix}`
  let convertedPath = `${filepath}.wav`

  // let uploadPath = path.join(__dirname, '../public/audio/query')

  fs.renameSync(filepath, newPath)

  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

  // Convert into 16000 wav file
  utility.convertAudio(newPath, convertedPath)
    .then((outputPath) => audioSemanticService(outputPath))
    .then((data) => {
      // Process resp
      let resp = JSON.parse(data).data
      let query = resp.text

      parseResp(resp).then((answer) => {

          logQuery(query, ip, true).then(() => {

            res.json(answer)
          })
        })
        .catch((err) => {

          logQuery(query, ip, false).then(() => {

            res.send(err)
          })
        })
    })
    .catch((err) => {
      logQuery(query, ip, false)
      return res.json({
        'error': err
      })
    })
})

router.get('/test', function (req, res) {

  let inputPath = path.join(__dirname, '../public/audio/query/whatdog.mp3')
  let outputPath = path.join(__dirname, '../public/audio/query/whatdog.wav')

  utility.convertAudio(inputPath, outputPath).then((outputPath) => {
    console.log(outputPath)
    res.send('success')
  }).catch((err) => {
    res.send('fail')
  })
})

router.get('/testtts', function (req, res) {

  ttsService('你想学习什么小动物呢？').then(() => {

    res.send('finish')
  })
})

module.exports = router