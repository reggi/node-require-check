#!/usr/bin/env node
import {RequireCheck} from './require_check';

(async () => {
  await RequireCheck.cli(process);
})();
