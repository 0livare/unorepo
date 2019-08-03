const execa = require('execa')
var emoji = require('node-emoji')

const logger = require('../util/logger')
const getPackagesInfo = require('../util/getPackagesInfo')

async function execute(command, packageName, args) {
  let allPackagesInfo = await getPackagesInfo(packageName)

  if (!allPackagesInfo.length) {
    logger.error('No packages remaining after filter')
    return
  }

  if (allPackagesInfo.length === 1 && args.async) {
    logger.error(
      `Cannot run command async in a single package (${packageName})`,
    )
    return
  }

  let ranInPackages = []
  let promises = []

  for (let packageInfo of allPackagesInfo) {
    try {
      let promise = runCommand(command, packageInfo)

      if (args.async) {
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

  try {
    let successCount

    if (args.async) {
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

    if (successCount) {
      console.log('')
      logger.success(
        `Successfully ran "${command} in these ${successCount} (of ${
          allPackagesInfo.length
        })`,
        ranInPackages,
      )
    } else {
      logger.error('')
      logger.error(
        `Failed to run "${command}" in all packages ${emoji.get('cry')}`,
      )
      logger.error('')
    }
  } catch (e) {
    logger.error(e)
  }
}

async function runCommand(command, packageInfo) {
  return execa.command(command, {
    cwd: packageInfo.location,
    stdio: 'inherit',
  })
}

module.exports = execute
