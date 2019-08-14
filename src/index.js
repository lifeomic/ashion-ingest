'use strict';

const { ArgumentParser } = require('argparse');
const packageJson = require('../package.json');
const run = require('./run');

const parser = new ArgumentParser({
  version: packageJson.version,
  addHelp: true,
  description: packageJson.description
});

parser.addArgument(
  ['--input'],
  {
    required: true,
    help: 'Path to gzipped TAR file'
  }
);

parser.addArgument(
  ['--cnv'],
  {
    help: 'Path to output CNV CSV',
    defaultValue: '/tmp/copynumber.csv'
  }
);

parser.addArgument(
  ['--fnv'],
  {
    help: 'Path to output FNV CSV',
    defaultValue: '/tmp/structural.csv'
  }
);

const args = parser.parseArgs();
run(args);
