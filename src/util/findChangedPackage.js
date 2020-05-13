const getPackageJson = require('./getPackageJson')
const findNearestNodeModule = require('./findNearestNodeModule')

function findChangedPackage(changedFilePath) {
  const changedPackagePath = findNearestNodeModule(changedFilePath)
  const changedPackageName = getPackageJson(changedPackagePath).name

  return {
    name: changedPackageName,
    location: changedPackagePath,
  }
}

module.exports = findChangedPackage
