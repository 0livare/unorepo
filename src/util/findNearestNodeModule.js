const path = require('path')
const fs = require('fs')

/**
 * Find the nearest directory to the given path
 * which contains a package.json file
 */
function findNearestNodeModule(filePath) {
  const startingPath = path.dirname(filePath)
  return recursiveFindNearestNodeModule(startingPath)

  function recursiveFindNearestNodeModule(filePath) {
    let packageJsonPath = path.join(filePath, 'package.json')

    if (fs.existsSync(packageJsonPath)) {
      return path.dirname(packageJsonPath)
    }

    const parentDir = path.resolve(filePath, '..')
    return recursiveFindNearestNodeModule(parentDir)
  }
}

module.exports = findNearestNodeModule
