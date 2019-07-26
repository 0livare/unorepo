const monorepo = require('commander')

monorepo
  .command('bootstrap')
  .alias('b')
  .description('Link lerna packages together via symlinks')
  .action(require('./commands/bootstrap'))

monorepo
  .command('watch')
  .alias('w')
  .description('Watch for changes in all lerna packages')
  .action(require('./commands/watch'))

monorepo
  .command('list')
  .alias('ls')
  .description('Show info about each lerna package')
  .action(require('./commands/list'))

monorepo
  .command('dependencies')
  .alias('d')
  .description('Show dependencies of each yarn workspace')
  .action(require('./commands/dependencies'))

monorepo.version('0.0.0').parse(process.argv)
