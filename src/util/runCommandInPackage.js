const execa = require('execa')
const chalk = require('chalk')
const logger = require('./logger')
const stopwatch = require('./stopwatch')

async function runCommandInPackage({
  command,
  packagePath,
  shouldLog,
  packageName,
}) {
  let commands = command.split('&&').map(s => s.trim())
  stopwatch.start()

  for (let cmd of commands) {
    if (shouldLog !== false) {
      logger.expressive({
        text: cmd,
        emoji: 'running',
        colorFunc: chalk.gray,
      })
    }

    try {
      const {stdout} = await execa.command(cmd, {cwd: packagePath})

      if (stdout && shouldLog) {
        logger.expressive({text: stdout, omitPrefix: true})
      }

      return {stdout, packageName}
    } catch (e) {
      if (shouldLog) logger.expressive({text: e.stdout, omitPrefix: true})

      e.packageName = packageName
      return e
    }
  }

  if (shouldLog !== false) {
    stopwatch.stop().log()
  }
}

module.exports = runCommandInPackage
