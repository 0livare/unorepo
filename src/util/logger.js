const chalk = require('chalk')

function log(str, color = 'green') {
  let prefix = chalk[color]('[mono] ')
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

module.exports = {log, logArr, red, blue}
