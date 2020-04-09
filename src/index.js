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
  ['--testId'],
  {
    required: true,
    help: 'The test ID'
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
  ['--somaticVcf'],
  {
    help: 'Path to output somatic vcf',
    defaultValue: '/tmp/somatic.vcf.gz'
  }
);

parser.addArgument(
  ['--origSomaticVcf'],
  {
    help: 'Path to output original somatic vcf',
    defaultValue: '/tmp/somatic.orig.vcf'
  }
);

parser.addArgument(
  ['--germlineVcf'],
  {
    help: 'Path to output germline vcf',
    defaultValue: '/tmp/germline.vcf'
  }
);

parser.addArgument(
  ['--somaticBam'],
  {
    help: 'Path to output somatic BAM',
    defaultValue: '/tmp/somatic.bam'
  }
);

parser.addArgument(
  ['--germlineBam'],
  {
    help: 'Path to output germline BAM',
    defaultValue: '/tmp/germline.bam'
  }
);

parser.addArgument(
  ['--rnaBam'],
  {
    help: 'Path to output rna BAM',
    defaultValue: '/tmp/rna.bam'
  }
);

parser.addArgument(
  ['--reportFile'],
  {
    help: 'The report file path',
    defaultValue: '/tmp/report.pdf'
  }
);

parser.addArgument(
  ['--reportUrl'],
  {
    help: 'The report file URL'
  }
);

process.on('uncaughtException', function (err) {
  console.error('Uncaught exception ', (err.stack || err.toString()));
  process.exit(1);
});

process.on('unhandledRejection', function (reason, p) {
  console.error('Unhandled Rejection at: Promise ', p, ' reason: ', reason);
  process.exit(1);
});

const args = parser.parseArgs();
run(args);
