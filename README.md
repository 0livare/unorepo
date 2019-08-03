# Unorepo

A tool for managing a monorepo via Lerna and Yarn workspaces.

[Lerna] is a fantastic tool for managing monorepos at a high level, but things go more smoothly when allowing [Yarn workspaces] to handle the core logic of package resolution and linking at a low level. These two tools are also intended to [work together][lerna-yarn], so Unorepo assumes that you're using both. Because why wouldn't you be? :smile:

The purpose of Unorepo is to marry the functionality of Lerna and Yarn workspaces into one easy to use (and easier to remember!) place. Additionally, it adds some extra functionality that isn't present in either tool.

Some of the commands in this utility will merely be aliases to other commands in order to document their use and utility in a single place.

[lerna]: https://github.com/lerna/lerna
[yarn workspaces]: https://yarnpkg.com/lang/en/docs/workspaces/
[lerna-yarn]: https://github.com/lerna/lerna/pull/899

## Getting started

```bash
# Install with yarn
yarn global add unorepo

# Or install with npm
npm i -g unorepo

# Display the Unorepo commands
uno --help
```

## A note on language

Lerna and Yarn workspaces have some conflicting language. Given a monorepo of the following structure:

```
root
├── packages
│   ├── foo
│   │    └──  package.json
│   └── bar
│   │    └──  package.json
├── lerna.json
└── package.json
```

Lerna refers to _root_ as the "lerna workspace" or "lerna repo", and to _foo_ and _bar_ as "packages".

Yarn workspaces refers to _root_ as the "project", and to _foo_ and _bar_ as "workspaces".

The overlapping terminology is very confusing, so in attempt to be as clear as possible, Unorepo will avoid the word "workspace". We will refer to `root` as the **"project"**, and `foo` and `bar` as **"packages"**.

## Commands

### `uno watch`

Build a package and its dependents every time the package changes.

When a change is detected in a particular package, that package will be built and then each other package in the project that depends on the changed package will also be built. This ensures that all your packages are constantly up to date as you're developing them.

```bash
# Watch all file types for all changes, run 'yarn build' on change
uno watch

# Run 'yarn local' on change
uno watch --script local

# Watch only .ts and .scss files for change
uno watch --ext ts,scss

# Run a custom CLI command on change
uno watch --execute 'yarn build && yalc push --no-sig'
```

| Option            | Default     | Description                                                                                                         |
| ----------------- | ----------- | ------------------------------------------------------------------------------------------------------------------- |
| `--script`, `-s`  | build       | The script from `package.json` Unorepo will run to build each package                                               |
| `--ext`           | _ALL FILES_ | The file extensions to watch within the packages. To pass multiple extensions, separate with commas; e.g. `ts,scss` |
| `--execute`, `-x` | -           | Instead of running a predefined script on change, run an arbitrary CLI command.                                     |

### `uno execute '<command>' [pkg]`

Execute an arbitrary CLI command in one or all packages.

This can be any command that specifies a file (e.g. yarn, npm, echo, etc), followed by arguments. Shell-specific features will not work.

For best results, the command should be surrounded with quotes.

If the file or an argument contains spaces, they must be escaped with backslashes. This matters especially if command is not a constant but a variable, for example with `__dirname` or `process.cwd()`. Except for spaces, no escaping/quoting is needed.

```bash
uno execute 'echo cat'
uno execute --parallel 'pwd'
uno execute 'yarn build' my-package
```

| Parameter | Required? | Default        | Description                                                               |
| --------- | --------- | -------------- | ------------------------------------------------------------------------- |
| `command` | true      | -              | The CLI command to run. Must be quoted, and in the form `file arguments`. |
| `pkg`     | false     | _ALL PACKAGES_ | The name (or partial name) of the package to run `command` in.            |

| Option             | Default | Description                                     |
| ------------------ | ------- | ----------------------------------------------- |
| `--parallel`, `-p` | false   | Run the command in every package simultaneously |

### `uno bootstrap`

Link packages together via symlinks, and install missing dependencies. An alias for [`lerna bootstrap`][lerna-bootstrap], which is an [alias][lerna-yarn] for `yarn install`.

This linking is what allows your local packages to depend on each other directly in your file system, rather then depending on files copied into `node_modules` via a typical (and at times painful) publish and pull method (e.g. using [yalc]).

Yarn workspaces is really doing all the hard work here of resolving your dependencies and linking them together.

[lerna-bootstrap]: https://github.com/lerna/lerna/tree/master/commands/bootstrap
[yalc]: https://github.com/whitecolor/yalc

### `uno list`

Show information about each package, including the package's name, its version, and its relative file location within the project. An alias for [`lerna list --long`][lerna-list-long].

[lerna-list-long]: https://github.com/lerna/lerna/tree/master/commands/list#--long

### `uno dependencies`

List each package in the project and the other packages that it depends on. An alias for [`yarn workspaces info`][yarn-workspaces-info].

If all your packages are set up correctly, all the dependencies should be listed in the `workspaceDependencies` array, and the `mismatchedWorkspaceDependencies` arrays should all be empty.

If you have a dependency in `mismatchedWorkspaceDependencies` for a particular parent-package, this means that a non-local (probably from NPM or the like) version of that dependency-package will be used when the parent-package is run. So when you then make a local update to the dependency-package, that change will _not_ be reflected in the running parent-package.

The usual cause of this problem is mismatched version numbers. Ensure that the version number listed in the `package.json#version` field of the dependency-package matches the version listed in the `package.json#dependencies` section of the parent-package.

[yarn-workspaces-info]: https://yarnpkg.com/lang/en/docs/cli/workspaces/#toc-yarn-workspaces-info

### `uno run <script> <pkg>`

Run a package.json script in one or all packages.

If the second `pkg` argument is ommitted, the `script` will be run in all packages. If `pkg` is provided, the `script` will only be run in that particular package.

This command is similar to `uno execute`, but limited to predefined scripts in the package.json of each package.

```bash
# Run 'build' in all packages
uno run build

# Run 'test' in packages that start with 'button-'
uno run test 'button-*'
```

| Parameter | Required? | Default        | Description                                                               |
| --------- | --------- | -------------- | ------------------------------------------------------------------------- |
| `script`  | true      | -              | The name of a script defined in the package.json of the package(s)        |
| `pkg`     | false     | _ALL PACKAGES_ | The name of the single package to run the script in. May use glob syntax. |

## Building the project locally

```bash
# Clone the project
git clone https://github.com/zposten/unorepo.git
cd unorepo

# Install dependencies
yarn

# Build the project
yarn build

# Allow running "uno" in the terminal to run this project
yarn link

# Display the options for this CLI
uno --help
```

> Note: If you get "permission denied" when running the `uno` command, run `yarn postbuild`. This can happen if the `yarn build` command exits with errors.
