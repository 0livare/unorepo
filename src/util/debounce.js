// Modified from: https://davidwalsh.name/javascript-debounce-function

/**
 * @param {Function} func  The function to debounce
 * @param {number} wait The amount of time to wait before executing
 * func in milliseconds
 * @param {boolean} immediate Trigger the function on the leading edge
 * instead of the trailing.
 * @returns {Function} a function, that, as long as it continues to be invoked, will not
 * be triggered. `func` will be called after it stops being called for
 * `wait` milliseconds.
 */
function debounce(func, wait, immediate) {
  let timeoutId

  return (...args) => {
    let callNow = immediate && !timeoutId
    clearTimeout(timeoutId)

    timeoutId = setTimeout(() => {
      timeoutId = null
      if (!immediate) func.apply(this, ...args)
    }, wait)

    if (callNow) func.apply(this, ...args)
  }
}

module.exports = debounce
