const separators = [',', '||', '|', '*']

function splitList(list) {
  if (!list) return []

  for (let separator of separators) {
    if (list.includes(separator)) {
      return list.split(separator)
    }
  }

  // There is no separator, only a single value
  return [list]
}

module.exports = splitList
