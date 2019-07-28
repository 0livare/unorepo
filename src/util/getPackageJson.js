const fs = require('fs')

function getPackageJson(dir = undefined) {
  let path = `${dir ? dir : process.cwd()}/package.json`
  let packageJson = fs.readFileSync(path, {encoding: 'utf8'})
  return JSON.parse(packageJson)
}

module.exports = getPackageJson
