'use strict';

const packageJson = require('../package.json');
const bunyan = require('bunyan');
const bformat = require('bunyan-format');
const logger = bunyan.createLogger({
  name: packageJson.name,
  stream: bformat({ outputMode: 'short', color: false })
});

const tar = require('tar');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const path = require('path');
const cnv = require('./cnv');
const fnv = require('./fnv');
const rna = require('./rna');
const rnaFnv = require('./rna-fnv');
const other = require('./other');

const TAR_ROOT_DIR = '/tmp/contents';
const getValue = match => (match && match.length === 1) ? match[0] : null;

module.exports = async args => {
  logger.info(args, 'Starting...');

  const sampleId = path.parse(args.input).name.split('_').pop();

  await tar.x({
    file: args.input,
    cwd: TAR_ROOT_DIR
  });

  logger.info(`Tar extraction completed`);

  const cnvFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*copy_number*.vcf`));
  if (cnvFile) {
    await cnv(logger, sampleId, cnvFile, args.cnv);
    logger.info(`Processed CNV ${cnvFile}`);
  }

  const fnvFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*trn2*.vcf`));
  if (fnvFile) {
    await fnv(logger, sampleId, fnvFile, args.fnv);
    logger.info(`Processed FNV ${fnvFile}`);
  }

  const expressionFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*.quant.genes.sf`));
  if (expressionFile) {
    await rna(sampleId, expressionFile, args.expression);
    logger.info(`Processed expression ${expressionFile}`);
  }

  const rnaTransciptFile = getValue(await glob(`${TAR_ROOT_DIR}/**/st.*.vcf`));
  const rnaFusionFile = getValue(await glob(`${TAR_ROOT_DIR}/**/starFusion.*.vcf`));
  if (rnaTransciptFile || rnaFusionFile) {
    await rnaFnv(logger, sampleId, rnaTransciptFile, rnaFusionFile, args.rnaFnv);
    logger.info(`Processed expression fusion files ${rnaTransciptFile}/${rnaFusionFile}`);
  }

  const otherFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*other*.vcf`));
  if (otherFile) {
    await other(logger, args.project, args.patient, args.sequence, args.sequenceDate, otherFile, args.fhir);
    logger.info(`Processed other ${otherFile}`);
  }

  logger.info(args, `Finished`);
};
