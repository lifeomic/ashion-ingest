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
const childProcess = require('child_process');
const cnv = require('./cnv');
const fnv = require('./fnv');
const rna = require('./rna');
const rnaFnv = require('./rna-fnv');
const other = require('./other');

const TAR_ROOT_DIR = process.cwd();
const getValue = match => (match && match.length === 1) ? match[0] : null;

module.exports = async args => {
  logger.info(args, 'Starting...');

  await tar.x({
    file: args.input,
    cwd: TAR_ROOT_DIR
  });

  logger.info(`Tar extraction completed`);

  const somaticVcf = getValue(await glob(`${TAR_ROOT_DIR}/**/*.tnFreebayes.filt.snpEff.*.vcf`));
  if (!somaticVcf) {
    logger.error('Could not find somatic vcf file');
    throw new Error('Could not find somatic vcf');
  }

  const result = childProcess.execSync(`bcftools query -l ${somaticVcf}`);
  const samples = result.toString().split('\n');
  const somaticSample = samples.find(s => s.includes('T1'));
  const germlineSample = samples.find(s => s.includes('C1'));
  if (!somaticSample || !germlineSample) {
    throw new Error(samples, 'Could not determine samples from somatic vcf');
  }

  logger.info(`Processing with somatic sample ${somaticSample} and germline ${germlineSample}`);

  // pull out somatic sample with just hom / het variants
  childProcess.execSync(`bcftools view -s ${somaticSample} -i 'GT="hom" | GT="het"' ${somaticVcf} | bgzip -f -c > ${args.somaticVcf}`);

  const germlineVcf = getValue(await glob(`${TAR_ROOT_DIR}/**/*.germlineFreebayes.filt.norm.RESEARCHUSEONLY.snpEff.filt.vcf`));
  if (germlineVcf) {
    childProcess.execSync(`cp -f ${germlineVcf} ${args.germlineVcf} && bgzip -f ${args.germlineVcf}`);
  }

  const cnvFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*copy_number*.vcf`));
  if (cnvFile) {
    await cnv(logger, somaticSample, cnvFile, args.cnv);
    logger.info(`Processed CNV ${cnvFile}`);
  }

  const fnvFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*trn2*.vcf`));
  if (fnvFile) {
    await fnv(logger, somaticSample, fnvFile, args.fnv);
    logger.info(`Processed FNV ${fnvFile}`);
  }

  const expressionFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*.quant.genes.sf`));
  if (expressionFile) {
    await rna(somaticSample, expressionFile, args.expression);
    logger.info(`Processed expression ${expressionFile}`);
  }

  const rnaTransciptFile = getValue(await glob(`${TAR_ROOT_DIR}/**/st.*.vcf`));
  const rnaFusionFile = getValue(await glob(`${TAR_ROOT_DIR}/**/starFusion.*.vcf`));
  if (rnaTransciptFile || rnaFusionFile) {
    await rnaFnv(logger, somaticSample, rnaTransciptFile, rnaFusionFile, args.rnaFnv);
    logger.info(`Processed expression fusion files ${rnaTransciptFile}/${rnaFusionFile}`);
  }

  const otherFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*other*.vcf`));
  if (otherFile) {
    await other(logger, args.project, args.patient, args.sequence, args.sequenceDate, otherFile, args.fhir);
    logger.info(`Processed other ${otherFile}`);
  }

  logger.info(args, `Finished`);
};
