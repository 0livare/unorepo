const execa = require('execa')

const getPackageJson = require('./getPackageJson')
const findNearestNodeModule = require('./findNearestNodeModule')
const runCommandInPackage = require('./runCommandInPackage')

/**
 * Build the package that contains the changed file, and then
 * build each of the other packages that depends on that one.
 * @param {string} path The path to the changed file
 * @param {string} script The package.json script to run to build a package
 * @param {string} command The CLI command to run in each package.  If this
 * is passed, it will be run instead of the `script` passed
 * `scriptToRunOnChange`
 */
async function buildDependencyChain({path, script, command}) {
  const changedPackagePath = findNearestNodeModule(path)
  const changedPackageName = getPackageJson(changedPackagePath).name

  // Create a local function to build a package
  // in the correct fashion given the passed
  // parameters
  async function _buildPackage(pkgName, pkgPath) {
    if (command) {
      await runCommandInPackage(command, pkgPath)
    } else {
      await runScript(pkgName, script)
    }
  }

  // First build the package that has changed
  await _buildPackage(changedPackageName, changedPackagePath)

  // Then build all packages that depend on the one that has changed
  const dependentPackageInfos = await findDependentPackages(changedPackageName)
  await Promise.all(
    dependentPackageInfos.map(pkg => _buildPackage(pkg.name, pkg.location)),
  )
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

async function runScript(pkgName, scriptName) {
  const lernaArgs = ['run', scriptName, '--scope', pkgName]
  await execa('lerna', lernaArgs, {stdio: 'inherit'})
}

module.exports = buildDependencyChain
