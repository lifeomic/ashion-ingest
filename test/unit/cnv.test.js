'use strict';

const fs = require('fs');
const path = require('path');
const test = require('ava');
const cnv = require('../../src/cnv');

test.beforeEach(async t => {
  try {
    fs.unlinkSync(path.join(__dirname, 'cnv.csv'));
  } catch (ignored) {}
});

test.serial('The cnv function will parse an Ashion CNV VCF and convert to CSV', async t => {
  await cnv(console, 'sample', path.resolve(__dirname, '../data/input.copy_number.vcf'), path.join(__dirname, 'cnv.csv'));

  const result = fs.readFileSync(path.join(__dirname, 'cnv.csv'), 'utf8');
  t.is(result,
    `sample_id,gene,copy_number,status,attributes,chromosome,start_position,end_position,interpretation
sample,EGFR,19.75,amplification,{"LOG2FC":"3.3038333325885","SVTYPE":"<DUP>","SVLEN":"1"},chr7,55086793,55279321,unknown
sample,IFNA21,0.68,deletion,{"LOG2FC":"-1.55448749878354","SVTYPE":"<DEL>","SVLEN":"1"},chr9,21165635,21166659,unknown
`);
});
