#!/usr/bin/env node

const util = require('./util');
util.StartingOutput();
util.CreateFolders();

if (util.IsLegacyFetch()) {
  const LegacyFetch = require('./legacy');
  LegacyFetch.RunFetch();
} else {
  const SFFetch = require('./SF');
  SFFetch.RunFetch();
}

// Knowledge articles
const KB = require('./KB');
KB.RunFetch();
