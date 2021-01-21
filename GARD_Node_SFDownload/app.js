#!/usr/bin/env node

const util = require('./util');
util.startingOutput();

if (util.IsLegacyFetch()) {
  const LegacyFetch = require('./legacy');
  LegacyFetch.RunFetch();
} else {
  const SFFetch = require('./SF');
  SFFetch.RunFetch();
}
