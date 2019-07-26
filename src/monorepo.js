const monorepo = require('commander')

monorepo
  .command('bootstrap')
  .alias('b')
  .description('Link local packages together via symlinks')
  .action(require('./commands/bootstrap'))

monorepo
  .command('watch')
  .alias('w')
  .description('Watch for changes in all packages')
  .action(require('./commands/watch'))

monorepo.version('0.0.0').parse(process.argv)
