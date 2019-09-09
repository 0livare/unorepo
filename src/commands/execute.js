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
    try {
      let promise = runCommand(packageInfo)
      let result = await promise
      let {wasSuccessful, message, packageName} = result

      if (wasSuccessful) {
        logger.success(`Successfully ran "${command}" in ${packageName}`)
        if (message) logger.success(chalk.gray(message))

        return result
      }

      // Avoid repeating the error case, and just go to
      // the catch clause below
      throw result
    } catch (e) {
      logger.error(`Failed to run "${command}" in ${e.packageName}`)
      if (e.message) logger.error(chalk.gray(e.message))
      return e
    }
  }

  function runCommand(packageInfo) {
    return runCommandInPackage({
      command,
      packagePath: packageInfo.location,
      packageName: packageInfo.name,
      shouldLog: false,
    }).then(result => ({
      packageName: result.packageName,
      message: result.stdout,
      wasSuccessful: !(result instanceof Error),
    }))
  }
}

function reportStatus({command, results, shouldLogMessage}) {
  let successCount = results.filter(r => r.wasSuccessful).length
  let totalCount = results.length

  logger.log()
  logger.log()
  logger.log()

  if (!successCount) {
    logger.error(
      `Failed to run "${command}" in all packages ${emoji.get('cry')}`,
    )
    return
  }

  logger.success(
    `Successfully ran "${command}" in ${successCount} (of ${totalCount}) packages`,
  )

  for (let result of results) {
    let {packageName, message, wasSuccessful} = result
    let logFunc = wasSuccessful ? logger.success : logger.error
    logFunc('  ' + packageName)
    if (shouldLogMessage && message) logFunc('  ' + chalk.gray(message))
  }
}

module.exports = execute
