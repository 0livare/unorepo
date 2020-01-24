const chalk = require('chalk')
const logger = require('./logger')
const splitList = require('./splitList')

/**
 * Filter a list of packages by a filter string and outputs this information
 * to the user.
 *
 * @param {string} filterText A string or optionally a list of filters to match
 * against package names
 * @param {Array<{name: string}>} packageInfos An array of objects where each
 * object must have a "name" key with the name of a package
 * @returns The same array as was passed in to packageInfos with entries whose
 * "name" property didn't match any of the filters removed
 */
function filterPackages(filterText, packageInfos) {
  let filters = splitList(filterText)

  let filtered = packageInfos.filter(info => {
    if (!filterText) return true

    for (let filter of filters) {
      if (info.name.includes(filter)) return true
    }

    return false
  })

  if (packageInfos.length !== filtered.length) {
    logger.log(
      chalk.magenta('filter  ') + JSON.stringify(filtered.map(i => i.name)),
    )
  }

  if (!filtered.length) {
    logger.error('No packages remaining after filter')
  }

  return filtered
}

module.exports = filterPackages
