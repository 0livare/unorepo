const execa = require('execa')
const chalk = require('chalk')
const logger = require('./logger')
const Stopwatch = require('./stopwatch')

/**
 * Run an arbitrary CLI command in a specific package
 *
 * @param {string} command The command to run
 * @param {string} packagePath The path of the package to run the command in
 * @param {boolean} shouldLog If true, this function will log command output and timing
 * @param {string} packageName The name of the package -- only used for logging purposes
 * @returns `{
 *  failed: boolean,
 *  message: stdout or stderr, depending on failed,
 *  packageName: The same packageName passed into this function
 * }`
 */
async function runCommandInPackage({
  command,
  packagePath,
  shouldLog,
  packageName,
}) {
  let commands = command.split('&&').map(s => s.trim())
  let watch = new Stopwatch().start()

  let result

  for (let cmd of commands) {
    if (shouldLog !== false) {
      logger.expressive({
        text: cmd,
        emoji: 'running',
        colorFunc: chalk.gray,
      })
    }

    try {
      const commandResult = await execa.command(cmd, {cwd: packagePath})

      const {stdout} = commandResult
      if (stdout && shouldLog) {
        logger.expressive({text: stdout, omitPrefix: true})
      }

      // TODO: The return result will only incorporate the final command
      // when multiple are chained together with '&&
      commandResult.packageName = packageName
      commandResult.message = stdout
      result = commandResult
    } catch (e) {
      if (shouldLog) logger.expressive({text: e.stdout, omitPrefix: true})

      e.packageName = packageName
      e.message = e.stderr
      result = e

      break
    }
  }

  if (shouldLog !== false) {
    watch.stop().log()
  }

  return result
}

module.exports = runCommandInPackage
