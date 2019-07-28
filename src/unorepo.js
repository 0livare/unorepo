const unorepo = require('commander')

unorepo
  .command('bootstrap')
  .alias('b')
  .description('Link packages together via symlinks')
  .action(require('./commands/bootstrap'))

unorepo
  .command('watch')
  .alias('w')
  .option('-s, --script [script]', 'The script to run on change', 'build')
  .description('Run a script every time a package changes')
  .action(require('./commands/watch'))

unorepo
  .command('list')
  .alias('ls')
  .description('Show info about each package')
  .action(require('./commands/list'))

unorepo
  .command('dependencies')
  .alias('d')
  .description('Show dependencies of each package')
  .action(require('./commands/dependencies'))

unorepo
  .command('run <script> [<pkg>]')
  .alias('r')
  .description('Run a package.json script in one or all packages')
  .action(require('./commands/run'))

unorepo.version('0.0.1').parse(process.argv)
