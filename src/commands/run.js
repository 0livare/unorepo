const execute = require('./execute')

/*
 * Run a package.json script in one or all (public) packages
 */
async function run(scriptName, packageName, args) {
  // Lerna has similar functionality with
  // `lerna run --scope <packageName> <scriptName>`
  // but they use glob patterns for the package name filtering,
  // which is more arduous to type than I think it should be
  //
  // Yarn workspaces has similar functionality with
  // `yarn workspace <packageName> <scriptName>`, but the
  // output printed to the console isn't as information as
  // the lerna output.  Also, it does not avoid running the script
  // in private packages like lerna does.

  execute(`yarn run ${scriptName}`, packageName, args)
}

module.exports = run
