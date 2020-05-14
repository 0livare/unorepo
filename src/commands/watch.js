const chokidar = require('chokidar')
const {executeScriptInPackages} = require('./execute')
const {
  logger,
  getPackagesInfo,
  splitList,
  findChangedPackage,
  addFileGlobToPath,
  changeExtensionsToGlobs,
} = require('../util')

/** The command to execute in changed packages */
let command

/*
 * Watch for changes in each of the packages in this project
 */
async function watch(args) {
  try {
    command = args.execute || `yarn run ${args.script}`
    const packageInfo = await getPackagesInfo(null, args.includePrivate)
    createWatcher(packageInfo, args)
  } catch (error) {
    logger.error(`There was a problem watching the project: ${error}`)
    throw error
  }
}

async function createWatcher(packagesInfo, args) {
  let globs = changeExtensionsToGlobs(args.ext)

  let logText = globs
    ? `Watching ${JSON.stringify(globs)} from the following packages:`
    : 'Watching the following packages:'

  logger.logArr(
    logText,
    packagesInfo.map(pkg => pkg.name),
    'green',
  )

  // The regex replace here ensures that all paths use unix separators,
  // even if they came from a windows machine.  Chokidar requires unix
  // separators.
  let packagesPaths = packagesInfo.map(pkg => pkg.location.replace(/\\/g, '/'))
  let globbedPaths = addFileGlobToPath(globs, packagesPaths)

  let ignoredFiles = parseIgnoredFiles(splitList(args.ignore))

  let watcher = chokidar.watch(globbedPaths, {
    ignored: ignoredFiles,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: true, // Helps minimizing thrashing of watch events
  })

  return watcher.on('add', collectChanges).on('change', collectChanges)
}

/**
 * Go through the array looking for strings that represent
 * file paths, globs, and regex.  Pass through the former two
 * and turn regex strings in to RegExp objects.  Filter out
 * any invalid strings
 */
function parseIgnoredFiles(ignoredPathsGlobsAndRegex) {
  return ignoredPathsGlobsAndRegex
    .map(s => {
      if (!s) return null
      if (s.startsWith('/') || s.includes('*')) return s
      return new RegExp(s)
    })
    .filter(val => val)
}

let timeoutId
let paths = []
let running = Promise.resolve()

function collectChanges(path) {
  paths.push(path)
  logger.blue(`CHANGE: ${path}`)

  if (timeoutId) clearTimeout(timeoutId)

  timeoutId = setTimeout(() => {
    timeoutId = null

    // This will cause `runCommandInPackages` to run once
    // for every timeout where there are changes, but because
    // `runCommandInPackages` will pull all the currently
    // stored paths, remove duplicates, and then run those
    // packages, we are not duplicating the work if the same
    // package changes more than once while the previous
    // build was still running.
    running = running.then(runCommandInPackages)
  }, 200)
}

async function runCommandInPackages() {
  if (!paths.length) return

  // Store the package infos by name to ensure there are no duplicates
  let packageInfosByName = paths
    .map(findChangedPackage)
    .reduce((accum, curr) => {
      accum[curr.name] = curr
      return accum
    }, {})

  paths = []
  let packages = Object.values(packageInfosByName)

  if (packages.length > 1) {
    logger.log('')
    logger.logArr(
      `Running "${command}" in ${packages.length} packages`,
      packages.map(info => info.name),
    )
  }

  await executeScriptInPackages(command, packages)
}

module.exports = watch
