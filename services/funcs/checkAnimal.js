'use strict'

const utility = require('../../utility/utility')
const _ = require('lodash')
const db = require('../../db/connection')
const Promise = require('bluebird')

module.exports = (intent, entities) => {

  return new Promise(function (resolve, reject) {

    switch (intent) {

      case 'default_intent':
        return resolve(defaultIntent())

      case 'checkAnimal':
        return checkAnimalIntent(entities).then((answer) => {
          resolve(answer)
        }).catch((err) => {
          reject(err)
        })

      case 'compareAnimal':
        return resolve(compareAnimalIntent(entities))
    }
  })
}

function defaultIntent() {

  let resp = [
    '你想学习什么小动物呢？',
    '你想了解什么小动物呢？',
    '快来考考我你想了解什么小动物',
  ]

  // return random answer
  return utility.getRandomAnswer(resp)
}

function checkAnimalIntent(entities) {

  return new Promise(function (resolve, reject) {

    let res = _.find(entities, {
      name: 'animal'
    })
    if (!res) {

      return reject(utility.getRandomAnswer([
        '你想问小悠什么动物？',
        '小悠没听懂动物的名字，能再问一遍吗？'
      ]))
    }

    let animal = res.normValue
    // TODO: find animal from DB
    db('animal').select('*').where('animalName', animal).limit(1).then((rows) => {

      if (!rows || rows.length != 1) {

        return reject(utility.getRandomAnswer([
          '小悠不知道这个动物，小悠去学习一下',
          '这个动物小悠不知道，小悠要去学习一下'
        ]))
      }

      let resp = {
        answer: rows[0].desc,
        image: [],
        vocal: []
      }

      db('animalImage').select('*').where('animalId', rows[0].id).then((imgRows) => {

        if (imgRows && imgRows.length > 0) {

          resp.image = _.map(imgRows, 'imagePath')
        }

        db('animalAudio').select('*').where('animalId', rows[0].id).then((vocalRows) => {

          if (vocalRows && vocalRows.length > 0) {

            resp.vocal = _.map(vocalRows, 'audioPath')
          }

          resolve(resp)
        })
      })
    })
  })
}

function compareAnimalIntent(entities) {

}