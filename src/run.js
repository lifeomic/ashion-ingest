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

  logger.info(args, `Finished`);
};
