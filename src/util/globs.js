const path = require('path')

/**
 * Change strings from extension format to
 * glob format. Ex:
 *   - txt   -> **\/*.txt
 *   - .txt  -> **\/*.txt
 *   - *.txt -> **\/*.txt
 * @param {Array[string]} extensions
 */
function changeExtensionsToGlobs(extensions) {
  if (!extensions) return null

  return extensions.map(ext => {
    if (ext.startsWith('**/*.')) return ext
    if (ext.startsWith('*.')) return '**/' + ext
    if (ext.startsWith('.')) return '**/*' + ext
    return '**/*.' + ext
  })
}

/**
 * Join each of a number of globs to the end
 * of a number of paths resulting in
 * length(globs)*length(paths) resultant paths
 */
function addFileGlobToPath(globs, paths) {
  if (!globs || !globs.length) return paths

  let globbedPaths = []

  for (let filePath of paths) {
    for (let glob of globs) {
      globbedPaths.push(path.join(filePath, glob))
    }
  }

  return globbedPaths
}

module.exports = {
  changeExtensionsToGlobs,
  addFileGlobToPath,
}
