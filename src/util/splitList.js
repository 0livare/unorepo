function splitList(list) {
  let separators = [',', '||', '|', '*', '-', '/', '\\']

  for (let separator of separators) {
    if (list.includes(separator)) {
      return list.split(separator)
    }
  }

  // There is no separator, only a single value
  return [list]
}

module.exports = splitList
