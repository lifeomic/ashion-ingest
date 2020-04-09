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
const other = require('./other');
const report = require('./report');

const TAR_ROOT_DIR = process.cwd();
const getValue = match => (match && match.length === 1) ? match[0] : null;

module.exports = async args => {
  logger.info(args, 'Starting...');

  await tar.x({
    file: args.input,
    cwd: TAR_ROOT_DIR,
    filter: path => {
      return path.endsWith('.vcf') ||
        path.endsWith('.bam') ||
        path.endsWith('.sf') ||
        path.endsWith('.pdf');
    }
  });

  logger.info(`Tar extraction completed`);

  const somaticVcf = getValue(await glob(`${TAR_ROOT_DIR}/**/*.tnFreebayes.filt.snpEff.*.vcf`));
  if (!somaticVcf) {
    logger.error('Could not find somatic vcf file');
    throw new Error('Could not find somatic vcf');
  }

  const result = childProcess.execSync(`bcftools query -l ${somaticVcf}`);
  const samples = result.toString().split('\n');
  const somaticSample = samples.find(s => s.includes('Whole_T'));
  const germlineSample = samples.find(s => s.includes('Whole_C'));
  if (!somaticSample || !germlineSample) {
    throw new Error(`Could not determine samples from somatic vcf: ${samples}`);
  }

  logger.info(`Processing with somatic sample ${somaticSample} and germline ${germlineSample}`);

  // pull out somatic sample and exclude any 0/0 calls with an alternate read count of 0
  // eslint-disable-next-line
  childProcess.execSync(`bcftools view -s ${somaticSample} ${somaticVcf} | bcftools view --exclude 'GT="0/0" & FORMAT/AO=0' | sed 's~\t0/0:~\t0/1:~g' | bgzip -f -c > ${args.somaticVcf}`);
  if (args.origSomaticVcf) {
    childProcess.execSync(`cp -f ${somaticVcf} ${args.origSomaticVcf} && bgzip -f ${args.origSomaticVcf}`);
    logger.info(`Copied ${somaticVcf} to ${args.origSomaticVcf}`);
  }

  const germlineVcf = getValue(await glob(`${TAR_ROOT_DIR}/**/*.germlineFreebayes.filt.norm.RESEARCHUSEONLY.snpEff.filt.vcf`));
  if (germlineVcf) {
    childProcess.execSync(`cp -f ${germlineVcf} ${args.germlineVcf} && bgzip -f ${args.germlineVcf}`);
    logger.info(`Copied ${germlineVcf} to ${args.germlineVcf}`);
  }

  const germlineBam = getValue(await glob(`${TAR_ROOT_DIR}/**/*C1*.aligned.bam`));
  if (germlineBam) {
    childProcess.execSync(`cp -f ${germlineBam} ${args.germlineBam}`);
    logger.info(`Copied ${germlineBam} to ${args.germlineBam}`);
  }

  const somaticBam = getValue(await glob(`${TAR_ROOT_DIR}/**/*T1*.aligned.bam`));
  if (somaticBam) {
    childProcess.execSync(`cp -f ${somaticBam} ${args.somaticBam}`);
    logger.info(`Copied ${somaticBam} to ${args.somaticBam}`);
  }

  const rnaBam = getValue(await glob(`${TAR_ROOT_DIR}/**/*.std.STAR.bam`));
  if (rnaBam) {
    childProcess.execSync(`cp -f ${rnaBam} ${args.rnaBam}`);
    logger.info(`Copied ${rnaBam} to ${args.rnaBam}`);
  }

  const cnvFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*copy_number*.vcf`));
  if (cnvFile) {
    await cnv(logger, somaticSample, cnvFile, args.cnv);
    logger.info(`Processed CNV ${cnvFile}`);
  }

  const expressionFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*.quant.genes.sf`));
  if (expressionFile) {
    await rna(somaticSample, expressionFile, args.expression);
    logger.info(`Processed expression ${expressionFile}`);
  }

  const rnaTransciptFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*.st.*.vcf`));
  const rnaFusionFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*.starFusion.*.vcf`));
  const fnvFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*trn2*.vcf`));
  if (fnvFile || rnaTransciptFile || rnaFusionFile) {
    await fnv(logger, somaticSample, fnvFile, rnaTransciptFile, rnaFusionFile, args.fnv);
    logger.info(`Processed expression fusion files ${fnvFile}/${rnaTransciptFile}/${rnaFusionFile}`);
  }

  const otherFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*other*.vcf`));
  if (otherFile) {
    await other(logger, args.project, args.patient, args.sequence, args.sequenceDate, args.testId, otherFile, args.fhir);
    logger.info(`Processed other ${otherFile}`);
  }

  const pdfFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*.pdf`)) || getValue(await glob(`${TAR_ROOT_DIR}/*.pdf`));
  if (pdfFile) {
    childProcess.execSync(`cp -f '${pdfFile}' '${args.reportFile}'`);
    logger.info(`Coipied ${pdfFile} to ${args.reportFile}`);

    if (args.reportUrl) {
      await report(logger, args.project, args.patient, args.reportUrl, args.sequenceDate, args.fhir);
    }
  }

  logger.info(args, `Finished`);
};
