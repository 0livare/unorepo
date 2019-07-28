const monorepo = require('commander')

monorepo
  .command('bootstrap')
  .option(
    '-b, --bootstrap',
    'Bootstrap dependencies for the dependents of the current working directory',
  )
  .action(require('./commands/bootstrap'))

monorepo
  .command('watch')
  .option(
    '-w, --watch',
    'Start a watcher for the dependents of the current working directory.',
  )
  .action(require('./commands/watch'))

monorepo.version('0.0.0').parse(process.argv)
