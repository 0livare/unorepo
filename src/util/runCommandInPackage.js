const execa = require('execa')

async function runCommandInPackage(command, packagePath) {
  let commands = command.split('&&').map(s => s.trim())

  for (let cmd of commands) {
    await execa.command(cmd, {
      cwd: packagePath,
      stdio: 'inherit',
    })
  }
}

module.exports = runCommandInPackage
