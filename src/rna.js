'use strict';

const fs = require('fs');
const lineReader = require('line-reader');
const { promisify } = require('util');
const eachLine = promisify(lineReader.eachLine);

module.exports = async (sampleId, input, output) => {
  const stream = fs.createWriteStream(output, { flags: 'a+' });
  stream.write('sample_id,gene_id,gene_name,expression,raw_count,attributes,is_normalized,expression_unit\n');

  await eachLine(input, async (line, last, cb) => {
    if (line.startsWith('Name')) {
      cb();
      return;
    }

    const [gene, length, effectiveLength, tpm, numReads] = line.split('\t');
    const attributes = { effectiveLength, length };

    stream.write(`${sampleId},${gene},${gene},${tpm},${numReads},${JSON.stringify(attributes)},True,tpm\n`);

    cb();
  });

  stream.close();
};
