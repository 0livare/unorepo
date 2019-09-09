const logger = require('./logger')

function stopwatch() {
  let startTime
  let deltaInSec
  let watch = {}

  function start() {
    startTime = new Date()
    return watch
  }

  function stop() {
    let endTime = new Date()
    let deltaInMs = endTime - startTime
    deltaInSec = round(deltaInMs / 1000, 2)

    return watch
  }

  function log() {
    logger.expressive({
      text: `Done in ${deltaInSec}s`,
      emoji: 'sparkles',
    })

    return watch
  }

  watch = {start, stop, log}
  return watch
}

function round(num, decimalPlaces) {
  // If the number will be rounded to 0, just return it
  if (num < Math.pow(10, -decimalPlaces)) return num

  let multiplier = Math.pow(10, decimalPlaces)
  return Math.round(num * multiplier) / multiplier
}

module.exports = stopwatch
