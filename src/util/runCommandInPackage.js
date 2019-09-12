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
        logger.error(`Failed to run command "${cmd}" in ${packageName}`)

      e.packageName = packageName
      e.message = e.stderr

      if (e.stdout) {
        e.message += '\n\n'
        e.message += e.stdout
      }

      results.push(e)

      // Originally, I thought the code should break here, hypothesizing that
      // the most common case is where the later stringed commands depend on
      // the earlier ones.  But I think that is too presumptive here.  The user
      // will be able to see if each command fails, and then given their specific
      // context, should be able to understand that OF COURSE the second one failed,
      // because the first one already failed.
      // break
    }
  }

  if (shouldLog !== false) {
    watch.stop().log()
  }

  // Return a single object describing the overall result of this command
  return {
    ...results[0], // This is a bit of a cop-out, but often times useful
    // True if any sub command ("cmd1 && cmd2") failed
    failed: results
      .map(r => r.failed)
      .reduce((accum, didFail) => accum || didFail, false),
    message: results.map(r => r.message).join('\n\n'),
    packageName,
  }
}

module.exports = runCommandInPackage
