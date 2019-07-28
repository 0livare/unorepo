const execa = require('execa')

/*
 * From the context of the process.cwd(), find the package manifest name & bootstrap it's dependencies via lerna
 * */
function bootstrap() {
  try {
    const lernaArgs = ['bootstrap', '--include-filtered-dependencies']
    execa('lerna', lernaArgs, {stdio: 'inherit'})
  } catch (error) {
    throw new Error(`There was a problem trying to bootstrap the tree ${error}`)
  }
}

module.exports = bootstrap
