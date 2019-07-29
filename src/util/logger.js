const chalk = require('chalk')

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

function error(str) {
  let colorPrefix = chalk.keyword('red').inverse(prefixText.trim())
  let colorText = chalk.red(str)
  console.log(`${colorPrefix} ${colorText}`)
}

module.exports = {log, logArr, red, blue, error}
