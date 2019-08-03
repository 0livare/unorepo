const execa = require('execa')
const chalk = require('chalk')

const logger = require('./logger')

/**
 * Get the package information for all (public) packages in the project
 * @param {string} packageName The name (or partial name) of the
 * package(s) to filter to
 * @returns {
 *   name: The name of the package,
 *   version: The version of the package,
 *   private: The private flag from package's package.json,
 *   location: The filepath to this package
 * }
 */
async function getPackagesInfo(packageName) {
  const lernaArgs = ['ls', '--toposort', '--json']
  const {stdout} = await execa('lerna', lernaArgs)

  let info = JSON.parse(stdout)
  let filtered = info.filter(
    info => !packageName || info.name.includes(packageName),
  )

  logger.log(
    chalk.magenta('filter  ') + JSON.stringify(filtered.map(i => i.name)),
  )

  if (!filtered.length) {
    logger.error('No packages remaining after filter')
  }

  return filtered
}

module.exports = getPackagesInfo
