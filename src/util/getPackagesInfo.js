const execa = require('execa')
const filterPackages = require('./filterPackages')

/**
 * Get the package information for all (public) packages in the project
 * @param {string} packageName The name (or partial name) of the
 * package(s) to filter to
 * @param {boolean} includePrivate If true, private packages will be be
 * included as well
 * @returns {
 *   name: The name of the package,
 *   version: The version of the package,
 *   private: The private flag from package's package.json,
 *   location: The absolute file path to this package
 * }
 */
async function getPackagesInfo(packageName, includePrivate) {
  const lernaArgs = ['ls', '--toposort', '--json']
  if (includePrivate) lernaArgs.push('--all')

  const {stdout} = await execa('lerna', lernaArgs)
  let infos = JSON.parse(stdout)

  return filterPackages(packageName, infos)
}

module.exports = getPackagesInfo
