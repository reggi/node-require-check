# `require-check`

Checks that a given module is able to be required without any errors occurring.

When run as a CLI tool a directory is passed.

`npx require-check ./`

The tool will attempt to:

1. Install all the npm dependencies in a tmp directory
2. Require the module installed

This will ensure that the package being checked doesn't have any of the common
runtime bugs like missing a package dependency, and that the package overall is require-able.