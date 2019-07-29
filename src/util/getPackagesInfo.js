const execa = require('execa')

/**
 * Get the package information for all (public) packages in the project
 * @returns {
 *   name: The name of the package,
 *   version: The version of the package,
 *   private: The private flag from package's package.json,
 *   location: The filepath to this package
 * }
 */
async function getPackagesInfo() {
  const lernaArgs = ['ls', '--toposort', '--json']
  const {stdout, stderr} = await execa('lerna', lernaArgs)
  return JSON.parse(stdout)
}

module.exports = getPackagesInfo
