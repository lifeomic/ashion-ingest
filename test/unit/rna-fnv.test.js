'use strict';

const fs = require('fs');
const path = require('path');
const test = require('ava');
const fnv = require('../../src/rna-fnv');

test.beforeEach(async t => {
  try {
    fs.unlinkSync(path.join(__dirname, 'rna-fnv.csv'));
  } catch (ignored) {}
});

test.serial('The fnv function will parse an Ashion FNV VCF and convert to CSV', async t => {
  await fnv(console, 'sample', path.resolve(__dirname, '../data/st.inserted.derez.approved.vcf'), path.resolve(__dirname, '../data/starFusion.inserted.derez.approved.vcf'), path.join(__dirname, 'rna-fnv.csv'));

  const result = fs.readFileSync(path.join(__dirname, 'rna-fnv.csv'), 'utf8');
  t.is(result,
    `sample_id,gene1,gene2,effect,chromosome1,start_position1,end_position1,chromosome2,start_position2,end_position2,interpretation,sequence_type,in-frame,attributes
sample,MET,N/A,fusion_transcript,chr7,116411708,116411708,chr7,116414935,116414935,unknown,somatic,N/A,{"junction_count":"13","span_count":"0","ffpm":"0.123871"}
sample,LDLRAD4,SMARCA2,fusion,chr18,13438383,13438383,chr9,2028987,2028987,unknown,somatic,N/A,{"junction_count":"32","span_count":"7","ffpm":"0.412500"}
sample,RABEP1,NLRP1,fusion,chr17,5185815,5185815,chr17,5445347,5445347,unknown,somatic,N/A,{"junction_count":"16","span_count":"6","ffpm":"0.232800"}
`);
});
