
/* eslint camelcase: "off" */
const fs = require('fs');
const reader = require('./vcf-reader');

const formatGene = gene => gene.toLowerCase() === 'intergenic' ? 'N/A' : gene;

module.exports = async (logger, sampleId, input, output) => {
  const stream = fs.createWriteStream(output, { flags: 'a+' });
  stream.write('sample_id,gene1,gene2,effect,chromosome1,start_position1,end_position1,chromosome2,start_position2,end_position2,interpretation,sequence_type,in-frame,attributes\n');

  await reader(input, line => {
    const { sv_type, break_1, break_1_annotation, break_2, break_2_annotation } = line.info;
    if (!sv_type || !break_1 || !break_1_annotation || !break_2 || !break_2_annotation) {
      logger.error(line, 'Missing required structural fields');
      throw new Error('Missing required structural fields');
    }

    const [gene1] = break_1_annotation.split(':');
    const [chr1, pos1] = break_1.split(':');
    const [gene2] = break_2_annotation.split(':');
    const [chr2, pos2] = break_2.split(':');
    const attributes = { sv_type, break_1, break_1_annotation, break_2, break_2_annotation };

    stream.write(`${sampleId},${formatGene(gene1)},${formatGene(gene2)},${sv_type.toLowerCase()},chr${chr1},${pos1},${pos1},chr${chr2},${pos2},${pos2},unknown,somatic,N/A,"${JSON.stringify(attributes).replace(/"/g, '\'')}"\n`);
  });

  stream.close();
};
