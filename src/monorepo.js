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

monorepo
  .command('list')
  .alias('ls')
  .description('Show info about each package')
  .action(require('./commands/list'))

monorepo.version('0.0.0').parse(process.argv)
