const unorepo = require('commander')
const splitList = require('./util/splitList')

unorepo
  .command('watch')
  .alias('w')
  .description('Run a script every time a package changes')
  .action(require('./commands/watch'))
  .option('-s, --script <script>', 'The script to run on change', 'build')
  .option(
    '-x, --execute <command>',
    'Instead of a script, run a command on change',
  )
  .option('--ext <exts>', 'The file extensions to watch', splitList)
  .option(
    '-i, --ignore <files>',
    'Files/paths to be ignored',
    'node_modules,dist,build,bld',
  )
  .option(
    '-p, --include-private',
    'If passed, private packages will also be watched',
  )

unorepo
  .command('execute <cmd> [pkg]')
  .alias('x')
  .description('Run an arbitrary command in one or many packages')
  .action(require('./commands/execute').command)
  .option(
    '-p, --parallel',
    'Run the command in selected packages simultaneously',
  )

unorepo
  .command('run <script> [<pkg>]')
  .alias('r')
  .description('Run an NPM script in one or many packages')
  .action(require('./commands/run'))
  .option(
    '-p, --parallel',
    'Run the script in selected packages simultaneously',
  )

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
  .command('bootstrap')
  .alias('b')
  .description('Link packages together via symlinks')
  .action(require('./commands/bootstrap'))

unorepo.version('0.0.29').parse(process.argv)
