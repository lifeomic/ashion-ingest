'use strict';

const lineReader = require('line-reader');
const { promisify } = require('util');
const eachLine = promisify(lineReader.eachLine);

module.exports = (vcfFileName, lineFn) => {
  return eachLine(vcfFileName, async (line, last, cb) => {
    if (line.startsWith('#')) {
      cb();
      return;
    }

    const [chr, pos, id, ref, alt, qual, filter, info] = line.split('\t');
    const infoAttributes = {};
    if (info) {
      info.split(';').forEach(field => {
        const [name, value] = field.split('=');
        infoAttributes[name] = value;
      });
    }

    await lineFn({
      chr,
      pos,
      id,
      ref,
      alt,
      qual,
      filter,
      info: infoAttributes
    });

    cb();
  });
};
