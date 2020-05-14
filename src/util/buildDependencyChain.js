const execa = require('execa')
const executeScriptInPackages = require('../commands/execute')
  .executeScriptInPackages
const findChangedPackage = require('./findChangedPackage')

/**
 * Build the package that contains the changed file, and then
 * build each of the other packages that depends on that one.
 * @param {string} path The path to the changed file
 * @param {string} script The package.json script to run to build a package
 * @param {string} command The CLI command to run in each package.  If this
 * is passed, it will be run instead of the `script` passed
 * `scriptToRunOnChange`
 */
async function buildDependencyChain({path, command}) {
  let changedPackageInfo = findChangedPackage(path)
  const dependentPackageInfos = await findDependentPackages(
    changedPackageInfo.name,
  )
  let allPackageInfos = [changedPackageInfo, ...dependentPackageInfos]

  await executeScriptInPackages(command, allPackageInfos)
}

/**
 * Find all (public) packages that depend on this package
 * @returns {
 *   name: The name of the package,
 *   version: The version of the package,
 *   private: The private flag from package's package.json,
 *   location: The filepath to this package
 * }
 */
async function findDependentPackages(packageName) {
  const lernaArgs = [
    'ls',
    '--toposort',
    '--json',
    '--scope',
    packageName,
    '--include-filtered-dependents',
  ]
  const {stdout} = await execa('lerna', lernaArgs)

  let [changedPkg, ...dependentPackages] = JSON.parse(stdout)
  return dependentPackages
}

module.exports = buildDependencyChain
