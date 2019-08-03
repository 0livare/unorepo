const path = require('path')
const chokidar = require('chokidar')

const logger = require('../util/logger')
const buildDependencyChain = require('../util/buildDependencyChain')
const getPackagesInfo = require('../util/getPackagesInfo')

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

  if (globs) {
    logger.logArr(
      `Watching ${JSON.stringify(globs)} from the following packages:`,
      packagesInfo.map(pkg => pkg.name),
    )
  } else {
    logger.logArr(
      'Watching the following packages:',
      packagesInfo.map(pkg => pkg.name),
    )
  }

  let packagesPaths = packagesInfo.map(pkg => pkg.location)
  let globbedPaths = addFileGlobToPath(globs, packagesPaths)

  // prettier-ignore
  let watcher = chokidar.watch(globbedPaths, {
    ignored: [
      /lib|dist|build|bld/, // Ignore build output
      /node_modules/,       // Ignore node_modules
      /(^|[\/\\])\..+$/,    // Ignore dot files
    ],
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: true, // Helps minimizing thrashing of watch events
  })

  function _buildDependencyChain(changedFilePath) {
    buildDependencyChain({
      path: changedFilePath,
      script: args.script,
      command: args.execute,
    })
  }

  // Add event listeners
  return watcher
    .on('add', path => {
      logger.blue(`File ${path} was added`)
      _buildDependencyChain(path)
    })
    .on('change', path => {
      logger.blue(`File ${path} was changed`)
      _buildDependencyChain(path)
    })
    .on('unlink', path => {
      logger.blue(`File ${path} was removed`)
      _buildDependencyChain(path)
    })
}

/**
 * Change strings from extension format to
 * glob format (*.txt).
 * @param {Array[string]} extensions
 */
function changeExtensionsToGlobs(extensions) {
  if (!extensions) return null

  // Handle the case where only one extension was passed
  if (typeof extensions === 'string') {
    extensions = [extensions]
  }

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
