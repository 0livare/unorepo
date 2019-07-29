const chalk = require('chalk')
var emoji = require('node-emoji')

const prefixText = '[uno] '

function log(str, color = 'green') {
  let prefix = chalk[color](prefixText)
  console.log(`${prefix}  ${str}`)
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

function error(str, arr) {
  expressive(str, arr, 'x', 'red')
}

function success(str, arr) {
  expressive(str, arr, 'white_check_mark', 'green')
}

function expressive(str, arr, emojiName, color) {
  let colorPrefix = chalk.keyword(color).inverse(prefixText.trim())
  // let colorText = chalk.keyword(color)(str)

  console.log(`${colorPrefix} ${emoji.get(emojiName)}  ${str}`)

  if (!arr) return
  arr.forEach(item => expressive('  ' + item, null, emojiName, color))
}

module.exports = {log, logArr, red, blue, error, success}
