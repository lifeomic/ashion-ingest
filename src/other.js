
/* eslint camelcase: "off" */
const fs = require('fs');
const reader = require('./vcf-reader');

const TMB_CODES = {
  high: 'TMB-H',
  indeterminate: 'TMB-I',
  low: 'TMB-L'
};

const MSI_CODES = {
  stable: {
    display: 'Stable',
    code: 'LA14122-8'
  },
  high: {
    display: 'Unstable',
    code: 'LA14123-6'
  },
  indeterminate: {
    display: 'Indeterminate',
    code: 'LA11884-6'
  }
};

module.exports = async (logger, project, patient, sequence, sequenceDate, input, output) => {
  await reader(input, line => {
    if (line.info.TMBVALUE && line.info.TMBCATEGORY) {
      const obs = {
        effectiveDateTime: sequenceDate,
        meta: {
          tag: [
            {
              code: project,
              system: 'http://lifeomic.com/fhir/dataset'
            }, {
              code: 'LifeOmic Task Service',
              system: 'http://lifeomic.com/fhir/source'
            }, {
              code: 'tumor-mutation-burden',
              system: 'http://lifeomic.com/fhir/variant-type'
            }, {
              code: 'Ashion',
              system: 'http://lifeomic.com/fhir/report-source'
            }
          ]
        },
        code: {
          coding: [{
            code: 'TMB',
            system: 'http://lifeomic.com/fhir/biomarker',
            display: 'Tumor Mutation Burden'
          }]
        },
        component: [{
          code: {
            coding: [{
              code: 'TMB Status',
              system: 'http://lifeomic.com/fhir/biomarker',
              display: 'TMB Status'
            }]
          },
          valueCodeableConcept: {
            coding: [{
              code: TMB_CODES[line.info.TMBCATEGORY.toLowerCase()],
              system: 'http://lifeomic.com/fhir/biomarker',
              display: line.info.TMBCATEGORY.toLowerCase()
            }]
          }
        }, {
          code: {
            coding: [{
              code: 'TMB Score',
              system: 'http://lifeomic.com/fhir/biomarker',
              display: 'TMB Score'
            }]
          },
          valueQuantity: {
            unit: 'mutations-per-megabase',
            value: line.info.TMBVALUE
          }
        }],
        resourceType: 'Observation',
        subject: {
          reference: `Patient/${patient}`
        },
        status: 'final',
        extension: [{
          valueReference: {
            reference: `Sequence/${sequence}`
          },
          url: 'http://hl7.org/fhir/StructureDefinition/observation-geneticsSequence'
        }]
      };
      fs.appendFileSync(output, `${JSON.stringify(obs)}\n`);
      logger.info(obs, 'Saved TMB observation');
    } else if (line.info.MSICATEGORY) {
      const obs = {
        subject: {
          reference: `Patient/${patient}`
        },
        meta: {
          tag: [{
            code: project,
            system: 'http://lifeomic.com/fhir/dataset'
          }, {
            code: 'LifeOmic Task Service',
            system: 'http://lifeomic.com/fhir/source'
          }, {
            code: 'microsatellite-instability',
            system: 'http://lifeomic.com/fhir/variant-type'
          }, {
            code: 'Ashion',
            system: 'http://lifeomic.com/fhir/report-source'
          }]
        },
        status: 'final',
        effectiveDateTime: sequenceDate,
        valueCodeableConcept: {
          coding: [{
            display: MSI_CODES[line.info.MSICATEGORY.toLowerCase()].display,
            code: MSI_CODES[line.info.MSICATEGORY.toLowerCase()].code,
            system: 'http://loinc.org'
          }]
        },
        extension: [{
          url: 'http://hl7.org/fhir/StructureDefinition/observation-geneticsSequence',
          valueReference: {
            reference: `Sequence/${sequence}`
          }
        }],
        resourceType: 'Observation',
        code: {
          coding: [{
            display: 'Microsatellite instability [Interpretation] in Cancer specimen Qualitative.',
            code: '81695-9',
            system: 'http://loinc.org'
          }]
        }
      };
      fs.appendFileSync(output, `${JSON.stringify(obs)}\n`);
      logger.info(obs, 'Saved MSI observation');
    } else {
      logger.info(line, `Unknown line type`);
    }
  });
};
