const execa = require('execa')

/*
 * A synonym for `lerna bootstrap`.
 * Link local packages together via symlinks
 */
function bootstrap() {
  execa('lerna', ['bootstrap'], {stdio: 'inherit'})
}

module.exports = bootstrap
