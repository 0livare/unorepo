const execa = require('execa')

/*
 * Run a package.json script in one or all (public) packages
 */
async function run(scriptName, packageName) {
  if (packageName) {
    // Yarn workspaces has similar functionality with
    // `yarn workspace <packageName> <scriptName>`, but the
    // output printed to the console isn't as information as
    // the lerna output.
    execa('lerna', ['run', '--scope', packageName, scriptName], {
      stdio: 'inherit',
    })
  } else {
    // Yarn workspaces has similar functionality with
    // `yarn workspaces run <scriptName>`, but it does not avoid
    // running the script in private packages like I want it to.
    execa('lerna', ['run', scriptName], {stdio: 'inherit'})
  }
}

module.exports = run
