const execa = require('execa')

const getPackageJson = require('./getPackageJson')
const findNearestNodeModule = require('./findNearestNodeModule')

/*
 * Build the package that contains the changed file, and then
 * build each of the other packages that depends on that one.
 */
async function buildDependencyChain(changedFilePath, scriptToRunOnChange) {
  const changedPackagePath = findNearestNodeModule(changedFilePath)
  const changedPackageName = getPackageJson(changedPackagePath).name

  // First build the package that has changed
  await buildDependency(changedPackageName, scriptToRunOnChange)

  // Then build all packages that depend on the one that has changed
  const dependentPackages = await findDependentPackages(changedPackageName)
  await Promise.all(
    dependentPackages.map(pkg =>
      buildDependency(pkg.name, scriptToRunOnChange),
    ),
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

async function buildDependency(name, scriptToRunOnChange = 'build') {
  const lernaArgs = ['run', scriptToRunOnChange, '--scope', name]
  await execa('lerna', lernaArgs, {stdio: 'inherit'})
}

module.exports = buildDependencyChain
