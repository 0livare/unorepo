const execa = require('execa')
const chokidar = require('chokidar')

const logger = require('../util/logger')
const buildDependencyChain = require('../util/buildDependencyChain')

/*
 * Watch for changes in each of the packages in this workspace
 */
async function watch() {
  try {
    const packageInfo = await getPackagesInfo()
    spawnWatcher(packageInfo)
  } catch (error) {
    throw new Error(
      `There was a problem trying to watch the workspace: ${error}`,
    )
  }
}

/**
 * Get the package information for all (public) packages in the current workspace
 * @returns {
 *   name: The name of the package,
 *   version: The version of the package,
 *   private: The private flag from package's package.json,
 *   location: The filepath to this package
 * }
 */
async function getPackagesInfo() {
  try {
    const lernaArgs = ['ls', '--toposort', '--json']
    const {stdout, stderr} = await execa('lerna', lernaArgs)

    return JSON.parse(stdout)
  } catch (error) {
    throw new Error(
      `There was an error getting the workspace packages: ${error}`,
    )
  }
}

async function spawnWatcher(packagesInfo) {
  logger.logArr(
    'Watching the following packages:',
    packagesInfo.map(pkg => pkg.name),
  )

  let packagesPaths = packagesInfo.map(pkg => pkg.location)
  // prettier-ignore
  let watcher = chokidar.watch(packagesPaths, {
    ignored: [
      /(^|[\/\\])\../,    // Ignore dot files
      /node_modules/,     // Ignore node_modules
      /lib|dist/,         // Ignore build output files
      /\*___jb_tmp___/,   // Ignore jetbrains IDE temp files
    ],
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: true, // Helps minimizing thrashing of watch events
  })

  // Add event listeners
  return watcher
    .on('add', path => {
      logger.blue(`File ${path} has been added`)
      buildDependencyChain(path)
    })
    .on('change', path => {
      logger.blue(`File ${path} has been changed`)
      buildDependencyChain(path)
    })
    .on('unlink', path => {
      logger.blue(`File ${path} has been removed`)
      buildDependencyChain(path)
    })
}

module.exports = watch
