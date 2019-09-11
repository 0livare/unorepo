const execa = require('execa')
const chalk = require('chalk')
const logger = require('./logger')
const Stopwatch = require('./stopwatch')
const logCommandOutput = require('./logCommandOutput')

/**
 * Run an arbitrary CLI command in a specific package
 *
 * @param {string} command The command to run
 * @param {string} packagePath The path of the package to run the command in
 * @param {boolean} shouldLog If true, this function will log command output and timing
 * @param {string} packageName The name of the package -- only used for logging purposes
 * @returns `[{
 *  failed: boolean,
 *  message: stdout or stderr, depending on failed,
 *  packageName: The same packageName passed into this function
 * }]`
 */
async function runCommandInPackage({
  command,
  packagePath,
  shouldLog,
  packageName,
}) {
  let commands = command.split('&&').map(s => s.trim())
  let watch = new Stopwatch().start()

  let results = []

  for (let cmd of commands) {
    if (shouldLog !== false) {
      logger.expressive({
        text: cmd,
        emoji: 'running',
        colorFunc: chalk.gray,
      })
    }

    try {
      let commandResult = await execa.command(cmd, {cwd: packagePath})
      commandResult.packageName = packageName
      commandResult.message = commandResult.stdout || commandResult.stderr

      logCommandOutput(commandResult.stdout)
    } catch (e) {
      if (shouldLog !== false)
        logger.error(`Failed to run command "${command}" in ${packageName}`)

      e.packageName = packageName
      e.message = e.stderr || e.stdout
      results.push(e)

      break
    }
  }

  if (shouldLog !== false) {
    watch.stop().log()
  }

  // Return a single object describing the overall result of this command
  return {
    ...results[0],
    // True if any sub command ("cmd1 && cmd2") failed
    failed: results
      .map(r => r.failed)
      .reduce((accum, didFail) => accum || didFail, false),
    message: results.map(r => r.message).join('\n\n'),
    packageName,
  }
}

module.exports = runCommandInPackage
