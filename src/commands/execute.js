const emoji = require('node-emoji')
const chalk = require('chalk')

const logger = require('../util/logger')
const getPackagesInfo = require('../util/getPackagesInfo')
const runCommandInPackage = require('../util/runCommandInPackage')
const Stopwatch = require('../util/stopwatch')

async function execute(command, packageName, args) {
  let allPackagesInfo = await getPackagesInfo(packageName)
  if (!allPackagesInfo.length) return

  let watch = new Stopwatch().start()

  let results = []
  if (args.parallel) {
    logger.startSpinner(
      `Running "${command}" in ${allPackagesInfo.length} packages`,
    )
    results = await executeAll()
    logger.stopSpinner()
  } else {
    for (let packageInfo of allPackagesInfo) {
      logger.startSpinner(`Running "${command}" in ${packageInfo.name}`)
      results.push(await executeSingle(packageInfo))
      logger.stopSpinner()
    }
  }

  reportStatus({
    command,
    results,
    shouldLogMessage: args.parallel,
  })
  watch.stop().log()

  async function executeAll() {
    try {
      let promises = allPackagesInfo.map(runCommand)

      // Prevent the promises from rejecting so that Promise.all
      // waits for all of the promises to finish, regardless of
      // its success or error
      let promisesWhichCannotReject = promises.map(p => p.catch(e => e))
      return await Promise.all(promisesWhichCannotReject)
    } catch (e) {
      logger.error(e)
    }
  }

  async function executeSingle(packageInfo) {
    let promise = runCommand(packageInfo)
    let result = await promise
    let packageName = result.packageName

    if (result.failed) {
      logger.error(`Failed to execute "${command}" in ${packageName}`)
    } else {
      logger.success(`Successfully ran "${command}" in ${packageName}`)
    }

    logCommandOutput(result.message)
    return result
  }

  function runCommand(packageInfo) {
    return runCommandInPackage({
      command,
      packagePath: packageInfo.location,
      packageName: packageInfo.name,
      shouldLog: false,
    })
  }
}

function reportStatus({command, results, shouldLogMessage}) {
  let successCount = results.filter(r => !r.failed).length
  let totalCount = results.length

  logger.log()
  logger.log()
  logger.log()

  if (successCount) {
    logger.success(
      `Successfully ran "${command}" in ${successCount} (of ${totalCount}) packages`,
    )
  } else {
    logger.error(
      `Failed to run "${command}" in all ${totalCount} packages ${emoji.get(
        'cry',
      )}`,
    )
  }

  for (let result of results) {
    let {packageName, message, failed} = result
    let logFunc = failed ? logger.error : logger.success
    logFunc('  ' + packageName)
    if (shouldLogMessage) logCommandOutput(message)
  }
}

function logCommandOutput(message) {
  if (!message) return

  // Prefix each line of the output
  message = (message.trim() + '\n  ')
    .split('\n')
    .map(line => `${logger.prefixText}  ${line}`)
    .join('\n')

  logger.expressive({
    text: chalk.gray(message),
    omitPrefix: message.startsWith(logger.prefixText),
  })
}

module.exports = execute
