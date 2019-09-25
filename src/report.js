
/* eslint camelcase: "off" */
const fs = require('fs');

module.exports = async (logger, project, patient, fileUrl, sequenceDate, output) => {
  const stream = fs.createWriteStream(output, { flags: 'a+' });

  const report = {
    'resourceType': 'DiagnosticReport',
    'meta': {
      'tag': [
        {
          'system': 'http://lifeomic.com/fhir/dataset',
          'code': project
        }, {
          code: 'LifeOmic Task Service',
          system: 'http://lifeomic.com/fhir/source'
        }, {
          code: 'Ashion',
          system: 'http://lifeomic.com/fhir/report-source'
        }
      ]
    },
    'status': 'final',
    'code': {
      'text': 'Ashion GEM ExTra'
    },
    'effectiveDateTime': sequenceDate,
    'subject': {
      'reference': `Patient/${patient}`
    },
    'presentedForm': [{
      'url': fileUrl,
      'contentType': 'application/pdf',
      'title': 'Ashion GEM ExTra'
    }]
  };

  stream.write(`${JSON.stringify(report)}\n`);
  logger.info(report, 'Saved DiagnosticReport');

  stream.close();

  return new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.on('finish', resolve);
  });
};
