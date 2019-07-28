const path = require('path')
const execa = require('execa')
const chokidar = require('chokidar')

const logger = require('../util/logger')
const buildDependencyChain = require('../util/buildDependencyChain')

/*
 * Watch for changes in each of the packages in this project
 */
async function watch(args) {
  try {
    const packageInfo = await getPackagesInfo()
    createWatcher(packageInfo, args)
  } catch (error) {
    throw new Error(`There was a problem watching the project: ${error}`)
  }
}

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

async function createWatcher(packagesInfo, args) {
  let script = args.script
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

  // Add event listeners
  return watcher
    .on('add', path => {
      logger.blue(`File ${path} was added`)
      buildDependencyChain(path, script)
    })
    .on('change', path => {
      logger.blue(`File ${path} was changed`)
      buildDependencyChain(path, script)
    })
    .on('unlink', path => {
      logger.blue(`File ${path} was removed`)
      buildDependencyChain(path, script)
    })
}

/**
 * Change strings from extension format to
 * glob format (*.txt).
 * @param {Array[string]} extensions
 */
function changeExtensionsToGlobs(extensions) {
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
