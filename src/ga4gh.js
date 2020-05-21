'use strict';

const packageJson = require('../package.json');
const bunyan = require('bunyan');
const bformat = require('bunyan-format');
const logger = bunyan.createLogger({
  name: packageJson.name,
  stream: bformat({ outputMode: 'short', color: false })
});

const YAML = require('yamljs');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const tar = require('tar');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const childProcess = require('child_process');
const cnv = require('./cnv');
const fnv = require('./fnv');
const rna = require('./rna');
const other = require('./other2');
const pdf = require('./pdf');

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

  const rootFileName = path.basename(args.input).split('.')[0];
  await mkdirp(`${args.output}/${rootFileName}`);
  const prefix = `${args.output}/${rootFileName}/${rootFileName}`;
  const ymlPrefix = `${rootFileName}/${rootFileName}`;

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

  const yaml = {
    tests: [
      {
        name: 'Ashion',
        testType: 'GEM ExTra',
        reference: 'GRCh37',
        sourceFile: args.source,
        files: []
      }
    ]
  };

  const pdfFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*.pdf`)) || getValue(await glob(`${TAR_ROOT_DIR}/*.pdf`));
  if (pdfFile) {
    const patientInfo = await pdf(logger, pdfFile);

    yaml.tests[0].indexedDate = patientInfo.indexedDate;
    yaml.tests[0].bodySite = patientInfo.bodySite;
    yaml.tests[0].bodySiteDisplay = patientInfo.bodySite;
    yaml.tests[0].bodySiteSystem = 'http://ashion.com/bodySite';
    yaml.tests[0].patientIdentifier = patientInfo.mrn;
    yaml.tests[0].patientInfo = {
      firstName: patientInfo.firstName,
      lastName: patientInfo.lastName,
      dob: patientInfo.dob,
      gender: patientInfo.gender,
      identifiers: [
        {
          codingSystem: 'http://hl7.org/fhir/v2/0203',
          codingCode: 'MR',
          value: patientInfo.mrn
        }
      ]
    };

    childProcess.execSync(`cp -f '${pdfFile}' '${prefix}.pdf'`);
    logger.info(`Copied ${pdfFile} to ${prefix}.pdf`);
    yaml.tests[0].reportFile = `.lifeomic/ashion/${ymlPrefix}.pdf`;
  }

  // pull out somatic sample and exclude any 0/0 calls with an alternate read count of 0
  // eslint-disable-next-line
  childProcess.execSync(`bcftools view -s ${somaticSample} ${somaticVcf} | bcftools view --exclude 'GT="0/0" & FORMAT/AO=0' | sed 's~\t0/0:~\t0/1:~g' | bgzip -f -c > ${prefix}.somatic.vcf.gz`);
  childProcess.execSync(`cp -f ${somaticVcf} ${prefix}.somatic.orig.vcf && bgzip -f ${prefix}.somatic.orig.vcf`);
  logger.info(`Copied ${somaticVcf} to ${prefix}.somatic.orig.vcf.gz`);

  yaml.tests[0].files.push({
    type: 'shortVariant',
    sequenceType: 'somatic',
    fileName: `.lifeomic/ashion/${ymlPrefix}.somatic.vcf.gz`
  });

  const germlineVcf = getValue(await glob(`${TAR_ROOT_DIR}/**/*.germlineFreebayes.filt.norm.RESEARCHUSEONLY.snpEff.filt.vcf`));
  if (germlineVcf) {
    childProcess.execSync(`cp -f ${germlineVcf} ${prefix}.germline.vcf && bgzip -f ${prefix}.germline.vcf`);
    logger.info(`Copied ${germlineVcf} to ${prefix}.germline.vcf.gz`);

    yaml.tests[0].files.push({
      type: 'shortVariant',
      sequenceType: 'germline',
      fileName: `.lifeomic/ashion/${ymlPrefix}.germline.vcf.gz`
    });
  }

  const germlineBam = getValue(await glob(`${TAR_ROOT_DIR}/**/*C1*.aligned.bam`));
  if (germlineBam) {
    childProcess.execSync(`cp -f ${germlineBam} ${prefix}.germline.bam`);
    logger.info(`Copied ${germlineBam} to ${prefix}.germline.bam`);
    yaml.tests[0].files.push({
      type: 'read',
      sequenceType: 'germline',
      fileName: `.lifeomic/ashion/${ymlPrefix}.germline.bam`
    });
  }

  const somaticBam = getValue(await glob(`${TAR_ROOT_DIR}/**/*T1*.aligned.bam`));
  if (somaticBam) {
    childProcess.execSync(`cp -f ${somaticBam} ${prefix}.somatic.bam`);
    logger.info(`Copied ${somaticBam} to ${prefix}.somatic.bam`);
    yaml.tests[0].files.push({
      type: 'read',
      sequenceType: 'somatic',
      fileName: `.lifeomic/ashion/${ymlPrefix}.somatic.bam`
    });
  }

  const rnaBam = getValue(await glob(`${TAR_ROOT_DIR}/**/*.std.STAR.bam`));
  if (rnaBam) {
    childProcess.execSync(`cp -f ${rnaBam} ${prefix}.rna.bam`);
    logger.info(`Copied ${rnaBam} to ${prefix}.rna.bam`);
    yaml.tests[0].files.push({
      type: 'read',
      sequenceType: 'somatic',
      fileName: `.lifeomic/ashion/${ymlPrefix}.rna.bam`
    });
  }

  const cnvFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*copy_number*.vcf`));
  logger.info(cnvFile);
  if (cnvFile) {
    await cnv(logger, somaticSample, cnvFile, `${prefix}.copynumber.csv`);
    logger.info(`Processed CNV ${cnvFile}`);
    yaml.tests[0].files.push({
      type: 'copyNumberVariant',
      sequenceType: 'somatic',
      fileName: `.lifeomic/ashion/${ymlPrefix}.copynumber.csv`
    });
  }

  const expressionFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*.quant.genes.sf`));
  logger.info(expressionFile);
  if (expressionFile) {
    await rna(somaticSample, expressionFile, `${prefix}.expression.rgel`);
    logger.info(`Processed expression ${expressionFile}`);
    yaml.tests[0].files.push({
      type: 'expression',
      sequenceType: 'somatic',
      fileName: `.lifeomic/ashion/${ymlPrefix}.expression.rgel`
    });
  }

  const rnaTransciptFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*.st.*.vcf`));
  const rnaFusionFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*.starFusion.*.vcf`));
  const fnvFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*trn2*.vcf`));
  if (fnvFile || rnaTransciptFile || rnaFusionFile) {
    await fnv(logger, somaticSample, fnvFile, rnaTransciptFile, rnaFusionFile, `${prefix}.structural.csv`);
    logger.info(`Processed expression fusion files ${fnvFile}/${rnaTransciptFile}/${rnaFusionFile}`);
    yaml.tests[0].files.push({
      type: 'structuralVariant',
      sequenceType: 'somatic',
      fileName: `.lifeomic/ashion/${ymlPrefix}.structural.csv`
    });
  }

  const otherFile = getValue(await glob(`${TAR_ROOT_DIR}/**/*other*.vcf`));
  if (otherFile) {
    const values = await other(logger, otherFile);
    logger.info(`Processed other ${otherFile}`);
    yaml.tests[0].msi = values.msi;
    yaml.tests[0].tmb = values.tmb;
    yaml.tests[0].tmbScore = values.tmbScore;
  }

  const parsed = YAML.stringify(yaml, 4);
  fs.writeFileSync(`${prefix}.ga4gh.yml`, parsed);
};
