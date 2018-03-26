'use strict'

const fs = require('fs')
const path = require('path')
const md5 = require('md5')
const config = require('config')
const aiuiTtsConfig = config.get('aiuiTtsConfig')
const request = require('request')
const Promise = require('bluebird')
const url = aiuiTtsConfig.AIUI_HOST + aiuiTtsConfig.TTS_ENDPOINT

module.exports = (text) => {

  return new Promise((resolve, reject) => {

    //讯飞开放平台注册申请应用的应用ID(APPID)
    var xAppid = aiuiTtsConfig.APP_ID

    var timestamp = Date.parse(new Date())
    var curTime = timestamp / 1000

    var xParam = {
      "auf": "audio/L16;rate=16000",
      "aue": "mp3",
      "voice_name": "xiaoyan",
      "speed": "50",
      "volume": "50",
      "pitch": "50",
      "engine_type": "intp65",
      "text_type": "text"
    }

    xParam = JSON.stringify(xParam)
    var xParamBase64 = new Buffer(xParam).toString('base64')

    // 文字内容
    // var textBase64 = Buffer.from(text).toString('base64')
    var bodyData = `text=${text}`

    var apiKey = aiuiTtsConfig.API_KEY
    var token = apiKey + curTime + xParamBase64

    var xCheckSum = md5(token)

    let options = {
      url: url,
      method: 'POST',
      headers: {
        "X-Appid": xAppid,
        "X-CurTime": curTime,
        "X-Param": xParamBase64,
        "X-CheckSum": xCheckSum,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Charset': 'UTF-8'
      },
      body: bodyData
    }

    request.post(options, function (err, response, body) {

      if (err) {
        return reject(err)
      }

      if (response.headers['content-type'] === 'audio/mpeg') {

        let sid = response.headers['sid']

        fs.writeFileSync(path.join(__dirname, `../../public/audio/reply/audio-${sid}.mp3`), body)
      }
      resolve()
    })
  })
}