'use strict'

const utility = require('../../utility/utility')
const _ = require('lodash')
const db = require('../../db/connection')

module.exports = (intent, entities) => {
  
  switch(intent) {

    case 'default_intent': 
      return defaultIntent()

    case 'checkAnimal':
      return checkAnimalIntent(entities)
    
    case 'compareAnimal':
      return compareAnimalIntent(entities)
  }
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

  let res = _.find(entities, { name: 'animal' })
  if (!res || res.length != 1) {

    return utility.getRandomAnswer([
      '对不起，能再问小悠一遍吗？',
      '小悠没听懂，能再问一遍吗？'
    ])
  } 

  // let queryAnimal = res[0].value -- user asked animal name
  let animal = res[0].normValue

  // TODO: find animal from DB
  db('animal').select('*').where('animalName', animal).limit(1).then((rows) => {

    if (!rows || rows.length != 1) {

      return utility.getRandomAnswer([
        '小悠不知道，小悠去学习一下',
        '这个小悠不知道，小悠要去学习一下'
      ])
    }

    let desc = rows[0].desc

    db('animalImage').select('*').where('animalId', rows[0].id)
  })
}

function compareAnimalIntent(entities) {

}
