const fs = require('fs')
const path = require('path')

function getPackageJson(dir = undefined) {
  let cwd = dir || process.cwd()
  let filePath = path.join(cwd, 'package.json')

  let packageJson = fs.readFileSync(filePath, {encoding: 'utf8'})
  return JSON.parse(packageJson)
}

module.exports = getPackageJson
