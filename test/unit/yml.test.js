'use strict';

const fs = require('fs');
const path = require('path');
const test = require('ava');
const yml = require('../../src/yml');

test.beforeEach(async t => {
  try {
    fs.unlinkSync(path.join(__dirname, '../data/test.ga4gh.yml'));
  } catch (ignored) {}
});

test.serial('The yml function wll add tumor site predictions to the ga4gh yml', async t => {
  await yml(path.resolve(__dirname, '../data/test.ga4gh.tmp'), path.join(__dirname, '../data/pcann.json'), path.join(__dirname, '../data/cancerscope.json'));

  const result = fs.readFileSync(path.join(__dirname, '../data/test.ga4gh.yml'), 'utf8');
  console.log(result);
  t.is(result,
    `tests:
    -
        name: Ashion
        testType: Ashion
        reference: GRCh37
        patientId: 86dac4d7-1bb7-4e21-8137-a75ecd1c8845
        indexedDate: '2020-11-06T21:53:26.804Z'
        files:
            - {type: shortVariant, sequenceType: somatic, fileName: .lifeomic/hudson-alpha/86dac4d7-1bb7-4e21-8137-a75ecd1c8845/A000555_SL888888_hudson_alpha_orien.lifted.somatic.nrm.vcf.gz}
            - {type: shortVariant, sequenceType: germline, fileName: .lifeomic/hudson-alpha/86dac4d7-1bb7-4e21-8137-a75ecd1c8845/A000555_SL888888_hudson_alpha_orien.lifted.germline.nrm.vcf.gz}
            - {type: expression, sequenceType: somatic, fileName: .lifeomic/hudson-alpha/86dac4d7-1bb7-4e21-8137-a75ecd1c8845/A000555_SL888888_hudson_alpha_orien.rgel}
            - {type: structuralVariant, sequenceType: somatic, fileName: .lifeomic/hudson-alpha/86dac4d7-1bb7-4e21-8137-a75ecd1c8845/A000555_SL888888_hudson_alpha_orien.structural.csv}
        msi: indeterminate
        tumorTypePredictions:
            - {label: '[UCEC] uterine corpus endometrioid carcinoma', confidence: 0.6, source: PCANN, details: '[{"PCAlabel":"[UCEC] uterine corpus endometrioid carcinoma","PCAsample":"TCGA-AX-A3FS-01","PCAdistance":56.67290205053685},{"PCAlabel":"[BRCA] breast invasive carcinoma","PCAsample":"TCGA-HN-A2NL-01","PCAdistance":58.802572838789736},{"PCAlabel":"[UCEC] uterine corpus endometrioid carcinoma","PCAsample":"TCGA-E6-A2P8-01","PCAdistance":59.59628225764973},{"PCAlabel":"[BLCA] bladder urothelial carcinoma","PCAsample":"TCGA-YC-A9TC-01","PCAdistance":60.076819107574096},{"PCAlabel":"[UCEC] uterine corpus endometrioid carcinoma","PCAsample":"TCGA-EO-A22X-01","PCAdistance":60.309564422939275}]'}
            - {label: '[BLCA] Bladder Urothelial Carcinoma', confidence: 0.017444488, source: CancerScope, details: '[{"label":"BLCA_TS","pred":0.017444488,"freq":1,"models":"v1_rm500dropout","rank_pred":1,"cancerscope_label":"[BLCA] Bladder Urothelial Carcinoma"},{"label":"LUAD_TS","pred":0.015384787,"freq":1,"models":"v1_rm500","rank_pred":2,"cancerscope_label":"[LUAD] Lung adenocarcinoma"}]'}
`);
});
