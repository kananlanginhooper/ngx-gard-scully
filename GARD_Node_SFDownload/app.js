#!/usr/bin/env node

require('dotenv').config()
const util = require('../SharedClasses/util');
const ServerUtil = require('./ServerUtil');

ServerUtil.StartingOutput();
ServerUtil.CreateFolders();

if (ServerUtil.IsLegacyFetch()) {
  const LegacyFetch = require('./legacy');
  LegacyFetch.RunFetch();
} else {
  const SFFetch = require('./SF');
  SFFetch.RunFetch();
}

// Knowledge articles
const KB = require('./KB');
KB.RunFetch();
