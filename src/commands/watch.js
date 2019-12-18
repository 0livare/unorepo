const path = require('path')
const chokidar = require('chokidar')

const logger = require('../util/logger')
const buildDependencyChain = require('../util/buildDependencyChain')
const getPackagesInfo = require('../util/getPackagesInfo')
const splitList = require('../util/splitList')

/*
 * Watch for changes in each of the packages in this project
 */
async function watch(args) {
  try {
    const packageInfo = await getPackagesInfo()
    createWatcher(packageInfo, args)
  } catch (error) {
    logger.error(`There was a problem watching the project: ${error}`)
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

  let packagesPaths = packagesInfo.map(pkg => pkg.location)
  let globbedPaths = addFileGlobToPath(globs, packagesPaths)

  let ignoredFiles = splitList(args.ignore)
    .map(s => {
      if (!s) return undefined
      if (s.startsWith('/') || s.includes('*')) return s
      return new RegExp(s)
    })
    .filter(val => val)

  let watcher = chokidar.watch(globbedPaths, {
    ignored: ignoredFiles,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: true, // Helps minimizing thrashing of watch events
  })

  async function _buildDependencyChain(changedFilePath) {
    await buildDependencyChain({
      path: changedFilePath,
      script: args.script,
      command: args.execute,
    })
  }

  // Add event listeners

  let promise
  async function handleChange(verb, path) {
    if (promise) promise.then(doIt)
    else await doIt()

    async function doIt() {
      logger.blue(`${verb.toUpperCase()}: ${path}`)
      promise = _buildDependencyChain(path)
      await promise
      promise = null
    }
  }

  return watcher
    .on('add', path => handleChange('add', path))
    .on('change', path => handleChange('change', path))
}

/**
 * Change strings from extension format to
 * glob format (*.txt).
 * @param {Array[string]} extensions
 */
function changeExtensionsToGlobs(extensions) {
  if (!extensions) return null

  return extensions.map(ext => {
    if (ext.startsWith('*.')) return ext
    if (ext.startsWith('.')) return '*' + ext
    return '*.' + ext
  })
}

function addFileGlobToPath(globs, paths) {
  if (!globs || !globs.length) return paths

  let globbedPaths = []

  for (let filepath of paths) {
    for (let glob of globs) {
      globbedPaths.push(path.join(filepath, glob))
    }
  }

  return globbedPaths
}

module.exports = watch
