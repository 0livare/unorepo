# Monorepo Utility

A utility for managing a monorepo via lerna

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

### `monoreopo bootstrap`

From the context of the process.cwd(), find the package manifest name & bootstrap it's dependencies via lerna

### `monorepo watch`

From the context of the process.cwd(), find the package manifest name & spawn a filesystem watcher for it's tree.
