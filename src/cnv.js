const fs = require('fs');
const reader = require('./vcf-reader');

module.exports = async (logger, sampleId, input, output) => {
  const stream = fs.createWriteStream(output, { flags: 'a+' });
  stream.write('sample_id,gene,copy_number,status,attributes,chromosome,start_position,end_position,interpretation\n');

  await reader(input, line => {
    const { GENE, SVTYPE, SVLEN, LOG2FC } = line.info;
    const chrom = `chr${line.chr}`;
    const start = line.pos;
    const end = line.id;

    if (!GENE || !SVTYPE || !LOG2FC || !chrom || !start || !end) {
      logger.error(line, 'Missing required copy number fields');
      throw new Error('Missing required copy number fields');
    }

    const interpretation = 'N/A';
    let status;
    if (SVTYPE === '<DUP>') {
      status = 'amplification';
    } else if (SVTYPE === '<DEL>') {
      status = 'loss';
    } else {
      throw new Error(`Unknown SVTYPE ${SVTYPE}`);
    }
    const copyNumber = Math.round(2 * (Math.pow(2, parseFloat(LOG2FC, 10))) * 100) / 100;
    const attributes = { LOG2FC, SVTYPE, SVLEN };

    stream.write(`${sampleId},${GENE},${copyNumber},${status},"${JSON.stringify(attributes).replace(/"/g, '\'')}",${chrom},${start},${end},${interpretation}\n`);
  });

  stream.close();
};
