const execa = require('execa')

/*
 * A synonym for `lerna list --long`.
 * Show info about each package in the workspace.
 */
function list() {
  execa('lerna', ['list', '--long'], {stdio: 'inherit'})
}

module.exports = list
