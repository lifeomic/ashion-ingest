
/* eslint camelcase: "off" */
const fs = require('fs');
const reader = require('./vcf-reader');

const formatGene = gene => (!gene || gene.toLowerCase() === 'intergenic') ? 'N/A' : gene;

module.exports = async (logger, sampleId, transcriptInput, fusionInput, output) => {
  const stream = fs.createWriteStream(output, { flags: 'a+' });
  stream.write('sample_id,gene1,gene2,effect,chromosome1,start_position1,end_position1,chromosome2,start_position2,end_position2,interpretation,sequence_type,in-frame,attributes\n');

  if (transcriptInput) {
    await reader(transcriptInput, line => {
      const { GENE, left_chr, left_pos, right_chr, right_pos, junction_count, span_count, ffpm } = line.info;
      if (!GENE || !left_chr || !left_pos || !right_chr || !right_pos) {
        logger.error(line, 'Missing required structural fields');
        throw new Error('Missing required structural fields');
      }

      const attributes = { junction_count, span_count, ffpm };

      stream.write(`${sampleId},${formatGene(GENE)},N/A,rna_fusion_transcript,${left_chr},${left_pos},${left_pos},${right_chr},${right_pos},${right_pos},unknown,somatic,N/A,"${JSON.stringify(attributes).replace(/"/g, '\'')}"\n`);
    });
  }

  if (fusionInput) {
    await reader(fusionInput, line => {
      const { fusion_name, left_chr, left_pos, right_chr, right_pos, junction_count, span_count, ffpm } = line.info;
      if (!fusion_name || !left_chr || !left_pos || !right_chr || !right_pos) {
        logger.error(line, 'Missing required structural fields');
        throw new Error('Missing required structural fields');
      }

      const [gene1, gene2] = fusion_name.split('--');

      const attributes = { junction_count, span_count, ffpm };

      stream.write(`${sampleId},${formatGene(gene1)},${formatGene(gene2)},rna_fusion,${left_chr},${left_pos},${left_pos},${right_chr},${right_pos},${right_pos},unknown,somatic,N/A,"${JSON.stringify(attributes).replace(/"/g, '\'')}"\n`);
    });
  }

  stream.close();
};
