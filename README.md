# Monorepo

A tool for managing a monorepo via lerna and yarn workspaces.

[Lerna] is a fantastic tool for managing mono-repos at a high level, but things go much more smoothly when allowing [yarn workspaces] to handle the core logic of package resolution and linking at a low level. These two tools are also intended to [work together][lerna-yarn]! For that reason, Monorepo assumes that you're using both, because why wouldn't you be? :smile:

Some of the commands in this utility will merely be synonyms to other commands in order to document their use and utility in a single place.

[lerna]: https://github.com/lerna/lerna
[yarn workspaces]: https://yarnpkg.com/lang/en/docs/workspaces/
[lerna-yarn]: https://github.com/lerna/lerna/pull/899

## Getting started

```bash
# Install dependencies
yarn

# Build the project
yarn build

# Allow running "monorepo" in the terminal to run this project
yarn link

# Display the options for this utility
monorepo --help
```

> Note: If you get "permission denied" when running the `monorepo` command, run `yarn postbuild`. This can happen if the `yarn build` command exits with errors.

## Language

Lerna and yarn workspaces have some conflicting language. Given a mono-repo of the following structure:

```
root
├── packages
│   ├── foo
│   │    └──  package.json
│   └── bar
│   │    └──  package.json
│   lerna.json
└── package.json
```

Lerna refers to _root_ as the "lerna workspace" or "lerna repo", and to _foo_ and _bar_ as "packages".

Yarn workspaces refers to _root_ as the "project", and to _foo_ and _bar_ as "workspaces"

The overlapping terminology is very confusing, so in attempt to be as clear as possible, Monorepo will avoid the word "workspace". We will refer to `root` as the **"project"**, and `foo` and `bar` as **"packages"**.

## Commands

### `monorepo watch`

Watch for changes in each of the packages in the current project.

When a change is detected in a particular package, the package will be built (i.e. the `build` script in it's `package.json` will be run), followed by each other package in the project that depends on it.

### `monoreopo bootstrap`

Link packages together via symlinks, and install missing dependencies. A synonym for [`lerna bootstrap`][lerna-bootstrap], which (when using yarn workspaces) is a [synonym][lerna-yarn] for `yarn install`.

This is useful so that when `pkg-b` depends on `pkg-a`, when you make a change to `pkg-a`, `pkg-b` immediately receives that change because it's pointing to the source files for `pkg-a`, instead of files copied into `node_modules` via a typical publish and pull method (e.g. using [yalc]).

Sometimes `pkg-b` might depend on source files (e.g. [S]CSS files) and other times built files (e.g. typescript compiled to javascript). If `pkg-b` depends on built files, after a change is made to `pkg-a`, `pkg-a` will need to be built in order for `pkg-b` to be properly updated. The `monorepo watch` command can be utilized to do this automatically.

[lerna-bootstrap]: https://github.com/lerna/lerna/tree/master/commands/bootstrap
[yalc]: https://github.com/whitecolor/yalc

### `monorepo list`

Show information about each package, including the package's name, its version, and its relative file location within the project. A synonym for [`lerna list --long`][lerna-list-long].

[lerna-list-long]: https://github.com/lerna/lerna/tree/master/commands/list#--long

### `monorepo dependencies`

List each package in the project and the other packages that it depends on. A synonym for [`yarn workspaces info`][yarn-workspaces-info].

If all your packages are set up correctly, all the dependencies should be listed in the `workspaceDependencies` array, and the `mismatchedWorkspaceDependencies` arrays should all be empty.

If you have a dependency in `mismatchedWorkspaceDependencies` for a particular parent-package, this means that a non-local (probably from NPM or the like) version of that dependency-package will be used when the parent-package is run. That means that if you make a local update to the dependency-package, that change will _not_ be reflected in the running parent-package.

The usual cause of this problem is mismatched version numbers. Ensure that the version number listed in the `package.json#version` field of the dependency-package matches the version listed in the `package.json#dependencies` section of the parent-package.

[yarn-workspaces-info]: https://yarnpkg.com/lang/en/docs/cli/workspaces/#toc-yarn-workspaces-info
