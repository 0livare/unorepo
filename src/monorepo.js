const monorepo = require('commander')

monorepo
  .command('bootstrap')
  .alias('b')
  .description('Link packages together via symlinks')
  .action(require('./commands/bootstrap'))

monorepo
  .command('watch')
  .alias('w')
  .option('-s, --script [script]', 'The script to run on change', 'build')
  .description('Run a script every time a package changes')
  .action(require('./commands/watch'))

monorepo
  .command('list')
  .alias('ls')
  .description('Show info about each package')
  .action(require('./commands/list'))

monorepo
  .command('dependencies')
  .alias('d')
  .description('Show dependencies of each package')
  .action(require('./commands/dependencies'))

monorepo
  .command('run <script> [<pkg>]')
  .alias('r')
  .description('Run a package.json script in one or all packages')
  .action(require('./commands/run'))

monorepo.version('0.0.0').parse(process.argv)
