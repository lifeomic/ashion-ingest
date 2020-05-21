
/* eslint camelcase: "off" */
const reader = require('./vcf-reader');

module.exports = async (logger, input) => {
  const values = {};

  await reader(input, line => {
    if (line.info.TMBVALUE && line.info.TMBCATEGORY) {
      values.tmb = line.info.TMBCATEGORY.toLowerCase();
      values.tmbScore = parseFloat(line.info.TMBVALUE, 10);
    } else if (line.info.MSICATEGORY) {
      values.msi = line.info.MSICATEGORY.toLowerCase();
    } else {
      logger.info(line, `Unknown line type`);
    }
  });

  logger.info(values, `Collected values`);
  return values;
};
