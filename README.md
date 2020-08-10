# node-require-check

[![semantic
release](https://github.com/reggi/node-require-check/workflows/semantic%20release/badge.svg)](https://github.com/reggi/node-require-check/actions?query=workflow%3A%22semantic+release%22)
[![coverage](https://github.com/reggi/node-require-check/workflows/coverage/badge.svg)](https://reggi.github.io/node-require-check/)
[![npm version](https://badge.fury.io/js/require-check.svg)](https://www.npmjs.com/package/require-check)

Checks that a given module is able to be required without any errors occurring.

## Install

```
npm install require-check -g
require-check <project-directory>
```

## Use directly via `npx`

```
npx require-check <project-directory>
```

<!-- anything below this line will be safe from template removal -->

## How

The tool will attempt to:

1. Install all the npm dependencies in a tmp directory
2. Require the module installed

This will ensure that the package being checked doesn't have any of the common
runtime bugs like missing a package dependency, and that the package overall is require-able.
