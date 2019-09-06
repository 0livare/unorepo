const chalk = require('chalk')
var emojis = require('node-emoji')

const prefixText = '[uno]'

function log(text, color = 'green') {
  let prefix = chalk[color](prefixText)
  console.log(`${prefix}  ${text}`)
}

function logArr(str, arr) {
  log(str)

  if (!arr) return
  arr.forEach(item => log('  ' + item))
}

function red(str) {
  log(str, 'red')
}

function blue(str) {
  log(str, 'cyan')
}

function error(text, array) {
  expressive({text, array, emoji: 'x', prefixColorFunc: chalk.red})
}

function success(text, array) {
  expressive({
    text,
    array,
    emoji: 'white_check_mark',
    prefixColorFunc: chalk.green,
  })
}

function expressive(args) {
  let {text, array, emoji, colorFunc, prefixColorFunc, omitPrefix} = args

  let coloredPrefix = prefixColorFunc ? prefixColorFunc(prefixText) : prefixText
  coloredPrefix = omitPrefix ? '' : coloredPrefix + '  '

  let coloredText = colorFunc ? colorFunc(text) : text
  console.log(`${coloredPrefix}${emojis.get(emoji)}  ${coloredText}`)

  if (!array) return
  array.forEach(item => expressive({...args, text: '  ' + item, array: null}))
}

module.exports = {log, logArr, red, blue, error, success, expressive}
