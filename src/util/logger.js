const chalk = require('chalk')
var emojis = require('node-emoji')
const ora = require('ora')

const prefixText = '[uno]'
let loadingSpinner

function log(text, color = 'white') {
  expressive({text, prefixColorFunc: chalk[color]})
}

function logArr(str, arr, color) {
  log(str, color)

  if (!arr) return
  arr.forEach(item => log('  ' + item, color))
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

function startSpinner(text) {
  loadingSpinner = ora(text).start()
}

function stopSpinner() {
  loadingSpinner.stop()
  loadingSpinner = null
}

function expressive(args) {
  let {text, array, emoji, colorFunc, prefixColorFunc, omitPrefix} = args

  let coloredPrefix = prefixColorFunc ? prefixColorFunc(prefixText) : prefixText
  coloredPrefix = omitPrefix ? '' : coloredPrefix + '  '

  text = text || ''
  let coloredText = colorFunc ? colorFunc(text) : text
  let emojiText = emoji ? emojis.get(emoji) + '  ' : ''

  if (loadingSpinner) loadingSpinner.stop()
  console.log(coloredPrefix + emojiText + coloredText)
  if (loadingSpinner) loadingSpinner.start()

  if (!array) return
  array.forEach(item => expressive({...args, text: '  ' + item, array: null}))
}

module.exports = {
  log,
  logArr,
  red,
  blue,
  error,
  success,
  expressive,
  startSpinner,
  stopSpinner,
  prefixText,
}
