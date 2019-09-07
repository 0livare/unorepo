const execa = require('execa')
const chalk = require('chalk')
const logger = require('./logger')
const stopwatch = require('./stopwatch')

async function runCommandInPackage(command, packagePath) {
  let commands = command.split('&&').map(s => s.trim())
  stopwatch.start()

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

  stopwatch.stop().log()
}

module.exports = runCommandInPackage
