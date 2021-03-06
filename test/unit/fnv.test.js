'use strict';

const fs = require('fs');
const path = require('path');
const test = require('ava');
const fnv = require('../../src/fnv');

test.beforeEach(async t => {
  try {
    fs.unlinkSync(path.join(__dirname, 'fnv.csv'));
  } catch (ignored) {}
});

test.serial('The fnv function will parse an Ashion FNV VCF and convert to CSV', async t => {
  await fnv(console, 'sample', path.resolve(__dirname, '../data/trn2.reportable.vcf'), path.resolve(__dirname, '../data/st.inserted.derez.approved.vcf'), path.resolve(__dirname, '../data/starFusion.inserted.derez.approved.vcf'), path.join(__dirname, 'fnv.csv'));

  const result = fs.readFileSync(path.join(__dirname, 'fnv.csv'), 'utf8');
  t.is(result,
    `sample_id,gene1,gene2,effect,chromosome1,start_position1,end_position1,chromosome2,start_position2,end_position2,interpretation,sequence_type,in-frame,attributes
sample,BMP5,FAM155A,translocation,chr6,55724312,55724312,chr13,108518122,108518122,N/A,somatic,N/A,"{'sv_type':'TRANSLOCATION','break_1':'6:55724312','break_1_annotation':'BMP5:INTRON:1:-','break_2':'13:108518122','break_2_annotation':'FAM155A:EXON:1:-'}"
sample,CTD-2616J11.4,N/A,translocation,chr19,51892332,51892332,chr22,47752373,47752373,N/A,somatic,N/A,"{'sv_type':'TRANSLOCATION','break_1':'19:51892332','break_1_annotation':'CTD-2616J11.4:EXON:2:-','break_2':'22:47752373','break_2_annotation':'INTERGENIC'}"
sample,IGHMBP2,MRGPRF,inversion,chr11,68671706,68671706,chr11,68773297,68773297,N/A,somatic,N/A,"{'sv_type':'INVERSION','break_1':'11:68671706','break_1_annotation':'IGHMBP2:INTRON:1:+','break_2':'11:68773297','break_2_annotation':'MRGPRF:EXON:3:-'}"
sample,SNRPA,CYP2S1,inversion,chr19,41263283,41263283,chr19,41708231,41708231,N/A,somatic,N/A,"{'sv_type':'INVERSION','break_1':'19:41263283','break_1_annotation':'SNRPA:EXON:2:+','break_2':'19:41708231','break_2_annotation':'CYP2S1:INTRON:6:+'}"
sample,HRC,KLK7,duplication,chr19,49657779,49657779,chr19,51484625,51484625,N/A,somatic,N/A,"{'sv_type':'DUPLICATION','break_1':'19:49657779','break_1_annotation':'HRC:EXON:1:-','break_2':'19:51484625','break_2_annotation':'KLK7:INTRON:3:-'}"
sample,DHX34,FUT1,duplication,chr19,47861484,47861484,chr19,49255988,49255988,N/A,somatic,N/A,"{'sv_type':'DUPLICATION','break_1':'19:47861484','break_1_annotation':'DHX34:INTRON:4:+','break_2':'19:49255988','break_2_annotation':'FUT1:EXON:3:-'}"
sample,N/A,ZNF652,translocation,chr1,120202181,120202181,chr17,47394531,47394531,N/A,somatic,N/A,"{'sv_type':'TRANSLOCATION','break_1':'1:120202181','break_1_annotation':'INTERGENIC','break_2':'17:47394531','break_2_annotation':'ZNF652:EXON:2:-'}"
sample,MET,N/A,rna_fusion_transcript,chr7,116411708,116411708,chr7,116414935,116414935,N/A,somatic,N/A,"{'junction_count':'13','span_count':'0','ffpm':'0.123871'}"
sample,LDLRAD4,SMARCA2,rna_fusion,chr18,13438383,13438383,chr9,2028987,2028987,N/A,somatic,N/A,"{'junction_count':'32','span_count':'7','ffpm':'0.412500'}"
sample,RABEP1,NLRP1,rna_fusion,chr17,5185815,5185815,chr17,5445347,5445347,N/A,somatic,N/A,"{'junction_count':'16','span_count':'6','ffpm':'0.232800'}"
`);
});
