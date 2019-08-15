'use strict';

const fs = require('fs');
const path = require('path');
const test = require('ava');
const rna = require('../../src/rna');

test.beforeEach(async t => {
  try {
    fs.unlinkSync(path.join(__dirname, 'rna.rgel'));
  } catch (ignored) {}
});

test.serial('The rna function will parse an Ashion expression file and convert to RGEL', async t => {
  await rna('sample', path.resolve(__dirname, '../data/REASEARCHUSEONLY.quant.genes.sf'), path.join(__dirname, 'rna.rgel'));

  const result = fs.readFileSync(path.join(__dirname, 'rna.rgel'), 'utf8');
  console.log(result);
  t.is(result,
    `sample_id,gene_id,gene_name,expression,raw_count,attributes,is_normalized,expression_unit
sample,BRAF,BRAF,14.9771,5140.05,{"effectiveLength":"3762.3","length":"4673.7"},True,tpm
sample,KRAS,KRAS,5.49016,1555.22,{"effectiveLength":"3105.43","length":"4892.56"},True,tpm
`);
});
