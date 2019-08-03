var emoji = require('node-emoji')

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

  let ranInPackages = []
  let promises = []

  for (let packageInfo of allPackagesInfo) {
    try {
      let promise = runCommandInPackage(command, packageInfo.location)

      if (args.parallel) {
        promises.push(promise)
      } else {
        await promise
        logger.success(`Successfully ran "${command}" in ${packageInfo.name}`)
        ranInPackages.push(packageInfo.name)
      }
    } catch (e) {
      logger.error(`Failed to run "${command}" in ${packageInfo.name}`)
    }
  }

  let successCount

  try {
    if (args.parallel) {
      // Prevent the promises from rejecting so that Promise.all
      // waits for all of the promises to finish, regardless of
      // its success or error
      let promisesWhichCannotReject = promises.map(p => p.catch(e => e))
      let results = await Promise.all(promisesWhichCannotReject)

      let errorCount = results
        .map(r => r instanceof Error)
        .reduce((errorCount, isError) => {
          return isError ? errorCount + 1 : errorCount
        }, 0)

      successCount = allPackagesInfo.length - errorCount
    } else {
      successCount = ranInPackages.length
    }
  } catch (e) {
    logger.error(e)
  }

  reportStatus(successCount, allPackagesInfo.length)
}

function reportStatus(successCount, totalCount) {
  if (successCount) {
    console.log('') // Print blank line
    logger.success(
      `Successfully ran "${command} in these ${successCount} (of ${totalCount})`,
      ranInPackages,
    )
  } else {
    logger.error('') // Print blank error line
    logger.error(
      `Failed to run "${command}" in all packages ${emoji.get('cry')}`,
    )
    logger.error('') // Print blank error line
  }
}

module.exports = execute
