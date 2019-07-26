# Monorepo

A tool for managing a monorepo via lerna and yarn workspaces.

Some of the commands in this utility will merely be synonyms to other commands in order to document their use and utility in a single place.

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

## Commands

### `monorepo watch`

Watch for changes in each of the packages in the current lerna workspace.

When a change is detected in a particular lerna package, the package will be built (i.e. the `build` script in it's `package.json` will be run), followed by each other package in the workspace that depends on it.

> Note: A "lerna workspace" is the directory that contains the `lerna.json` file, and a "lerna package" is any directory that matches one of the globs in the `packages` field of `lerna.json`.

### `monoreopo bootstrap`

A synonym for [`lerna bootstrap`][lerna-bootstrap]. Link lerna packages together via symlinks.

This is useful so that when `pkg-b` depends on `pkg-a`, when you make a change to `pkg-a`, `pkg-b` immediately receives that change because it's pointing to the source files for `pkg-a`, instead of files copied into `node_modules` via a typical publish and pull method.

Sometimes `pkg-b` might depend on source files (e.g. [S]CSS files) and other times built files (e.g. typescript compiled to javascript). If `pkg-b` depends on built files, after a change is made to `pkg-a`, `pkg-a` will need to be built in order for `pkg-b` to be properly updated. The `monorepo watch` command can be utilized to do this automatically.

[lerna-bootstrap]: https://github.com/lerna/lerna/tree/master/commands/bootstrap

### `monorepo list`

A synonym for [`lerna list --long`][lerna-list-long]. Show information about each lerna package, including the package's name, its version, and its relative file location within the lerna workspace.

[lerna-list-long]: https://github.com/lerna/lerna/tree/master/commands/list#--long
