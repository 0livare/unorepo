const emoji = require('node-emoji')

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
    let promises = allPackagesInfo.map(runCommand)
    results = await executeInParallel(promises)
    logger.stopSpinner()
  } else {
    for (let packageInfo of allPackagesInfo) {
      logger.startSpinner(`Running "${command}" in ${packageInfo.name}`)
      let promise = runCommand(packageInfo)
      let result = await executeSingle(promise)
      results.push(result)
      logger.stopSpinner()
    }
  }

  let finalResults = results.map(r => ({
    packageName: r.packageName,
    message: r.stdout,
    wasSuccessful: !(r instanceof Error),
  }))

  reportStatus({
    command,
    results: finalResults,
  })

  watch.stop().log()

  function runCommand(packageInfo) {
    return runCommandInPackage({
      command,
      packagePath: packageInfo.location,
      packageName: packageInfo.name,
      shouldLog: false,
    })
  }

  async function executeInParallel(promises) {
    try {
      // Prevent the promises from rejecting so that Promise.all
      // waits for all of the promises to finish, regardless of
      // its success or error
      let promisesWhichCannotReject = promises.map(p => p.catch(e => e))
      return await Promise.all(promisesWhichCannotReject)
    } catch (e) {
      logger.error(e)
    }
  }

  async function executeSingle(promise) {
    try {
      let result = await promise
      let wasSuccessful = !(result instanceof Error)

      if (wasSuccessful) {
        logger.success(`Successfully ran "${command}" in ${result.packageName}`)
        return result
      }

      // Avoid repeating the error case, and just go to
      // the catch clause below
      throw result
    } catch (e) {
      logger.error(`Failed to run "${command}" in ${e.packageName}`)
      return e
    }
  }
}

function reportStatus({command, results}) {
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
    if (message) logFunc('  ' + message)
  }
}

module.exports = execute
