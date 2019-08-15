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
  ['--patient'],
  {
    required: true,
    help: 'The patient ID'
  }
);

parser.addArgument(
  ['--project'],
  {
    required: true,
    help: 'The project ID'
  }
);

parser.addArgument(
  ['--sequence'],
  {
    required: true,
    help: 'The sequence ID'
  }
);

parser.addArgument(
  ['--sequence-date'],
  {
    required: true,
    help: 'The sequence date'
  }
);

parser.addArgument(
  ['--fhir'],
  {
    help: 'Path to output FHIR resources',
    defaultValue: '/tmp/fhir.json'
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

parser.addArgument(
  ['--expression'],
  {
    help: 'Path to output expression RGEL',
    defaultValue: '/tmp/expression.rgel'
  }
);

parser.addArgument(
  ['--rnaFnv'],
  {
    help: 'Path to output expression fusions',
    defaultValue: '/tmp/rna-fusion.csv'
  }
);

const args = parser.parseArgs();
run(args);
