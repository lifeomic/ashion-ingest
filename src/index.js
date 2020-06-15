'use strict';

const { ArgumentParser } = require('argparse');
const packageJson = require('../package.json');
const run = require('./run');
const ga4gh = require('./ga4gh');

const parser = new ArgumentParser({
  version: packageJson.version,
  addHelp: true,
  description: packageJson.description
});

const subparsers = parser.addSubparsers({
  title: 'subcommands',
  dest: 'run'
});

const ga4ghcmd = subparsers.addParser('ga4gh', {addHelp: true});

ga4ghcmd.addArgument(
  ['--input'],
  {
    required: true,
    help: 'Path to gzipped TAR file'
  }
);

ga4ghcmd.addArgument(
  ['--source'],
  {
    help: 'Name of source file'
  }
);

ga4ghcmd.addArgument(
  ['--output'],
  {
    required: true,
    help: 'Output path for files'
  }
);

ga4ghcmd.addArgument(
  ['--includePatientInfo'],
  {
    help: 'If present, the patient info will be added to the manifest file'
  }
);

const ingest = subparsers.addParser('ingest', {addHelp: true});

ingest.addArgument(
  ['--input'],
  {
    required: true,
    help: 'Path to gzipped TAR file'
  }
);

ingest.addArgument(
  ['--patient'],
  {
    required: true,
    help: 'The patient ID'
  }
);

ingest.addArgument(
  ['--project'],
  {
    required: true,
    help: 'The project ID'
  }
);

ingest.addArgument(
  ['--sequence'],
  {
    required: true,
    help: 'The sequence ID'
  }
);

ingest.addArgument(
  ['--testId'],
  {
    required: true,
    help: 'The test ID'
  }
);

ingest.addArgument(
  ['--sequence-date'],
  {
    required: true,
    help: 'The sequence date'
  }
);

ingest.addArgument(
  ['--fhir'],
  {
    help: 'Path to output FHIR resources',
    defaultValue: '/tmp/fhir.json'
  }
);

ingest.addArgument(
  ['--cnv'],
  {
    help: 'Path to output CNV CSV',
    defaultValue: '/tmp/copynumber.csv'
  }
);

ingest.addArgument(
  ['--fnv'],
  {
    help: 'Path to output FNV CSV',
    defaultValue: '/tmp/structural.csv'
  }
);

ingest.addArgument(
  ['--expression'],
  {
    help: 'Path to output expression RGEL',
    defaultValue: '/tmp/expression.rgel'
  }
);

ingest.addArgument(
  ['--somaticVcf'],
  {
    help: 'Path to output somatic vcf',
    defaultValue: '/tmp/somatic.vcf.gz'
  }
);

ingest.addArgument(
  ['--origSomaticVcf'],
  {
    help: 'Path to output original somatic vcf',
    defaultValue: '/tmp/somatic.orig.vcf'
  }
);

ingest.addArgument(
  ['--germlineVcf'],
  {
    help: 'Path to output germline vcf',
    defaultValue: '/tmp/germline.vcf'
  }
);

ingest.addArgument(
  ['--somaticBam'],
  {
    help: 'Path to output somatic BAM',
    defaultValue: '/tmp/somatic.bam'
  }
);

ingest.addArgument(
  ['--germlineBam'],
  {
    help: 'Path to output germline BAM',
    defaultValue: '/tmp/germline.bam'
  }
);

ingest.addArgument(
  ['--rnaBam'],
  {
    help: 'Path to output rna BAM',
    defaultValue: '/tmp/rna.bam'
  }
);

ingest.addArgument(
  ['--reportFile'],
  {
    help: 'The report file path',
    defaultValue: '/tmp/report.pdf'
  }
);

ingest.addArgument(
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

if (args.run === 'ingest') {
  run(args);
} else if (args.run === 'ga4gh') {
  ga4gh(args);
}
