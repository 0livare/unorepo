const execa = require('execa')

/*
 * A synonym for `yarn workspaces info`.
 * List each yarn workspace and detail its dependency information.
 */
function dependencies() {
  execa('yarn', ['workspaces', 'info'], {stdio: 'inherit'})
}

module.exports = dependencies
