const execa = require('execa')
const chalk = require('chalk')
const logger = require('./logger')

async function runCommandInPackage(command, packagePath) {
  let commands = command.split('&&').map(s => s.trim())
  const startTime = new Date()

  for (let cmd of commands) {
    logger.expressive({
      text: cmd,
      emoji: 'running',
      colorFunc: chalk.gray,
    })

    try {
      await execa.command(cmd, {
        cwd: packagePath,
        stdio: 'inherit',
      })
    } catch (e) {
      // Do nothing, just go to the next command
    }
  }

  const endTime = new Date()
  const deltaInMs = endTime - startTime
  const deltaInSec = round(deltaInMs / 1000, 2)
  logger.expressive({
    text: `Done in ${deltaInSec}s`,
    emoji: 'sparkles',
  })
}

function round(num, decimalPlaces) {
  // If the number will be rounded to 0, just return it
  if (num < Math.pow(10, -decimalPlaces)) return num

  let multiplier = Math.pow(10, decimalPlaces)
  return Math.round(num * multiplier) / multiplier
}

module.exports = runCommandInPackage
