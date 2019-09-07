const emoji = require('node-emoji')
const chalk = require('chalk')

const logger = require('../util/logger')
const getPackagesInfo = require('../util/getPackagesInfo')
const runCommandInPackage = require('../util/runCommandInPackage')

async function execute(command, packageName, args) {
  let allPackagesInfo = await getPackagesInfo(packageName)
  if (!allPackagesInfo.length) return

  if (allPackagesInfo.length === 1 && args.parallel) {
    logger.error(
      `Cannot run command in parallel in a single package (${packageName})`,
    )
    return
  }

  let succeededInPackages = []
  let failedInPackages = []
  let promises = []

  logger.startSpinner('Running commands')

  for (let packageInfo of allPackagesInfo) {
    try {
      let promise = runCommandInPackage({
        command,
        packagePath: packageInfo.location,
        shouldLog: !args.parallel,
        packageName: packageInfo.name,
      })

      if (args.parallel) {
        promises.push(promise)
      } else {
        await promise
        logger.success(`Successfully ran "${command}" in ${packageInfo.name}`)
        succeededInPackages.push(packageInfo.name)
      }
    } catch (e) {
      logger.error(`Failed to run command in ${packageInfo.name}`)
      logger.error(e.message)
      failedInPackages.push(packageInfo.name)
    }
  }

  try {
    if (args.parallel) {
      // Prevent the promises from rejecting so that Promise.all
      // waits for all of the promises to finish, regardless of
      // its success or error
      let promisesWhichCannotReject = promises.map(p => p.catch(e => e))

      let resolvedPromises = await Promise.all(promisesWhichCannotReject)
      logger.stopSpinner()

      let results = resolvedPromises.map(r => ({
        packageName: r.packageName,
        message: r.stdout,
        wasSuccessful: !(r instanceof Error),
      }))

      reportStatus({
        command,
        results,
      })
    }
  } catch (e) {
    logger.error(e)
  }
}

function reportStatus({command, results}) {
  let successCount = results.filter(r => r.wasSuccessful).length
  let totalCount = results.length

  console.log('') // Print blank line

  if (!successCount) {
    logger.error(
      `Failed to run "${command}" in all packages ${emoji.get('cry')}`,
    )
    logger.error('') // Print blank error line
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
