'use strict';

const fs = require('fs');
const path = require('path');
const test = require('ava');
const report = require('../../src/report');

test.beforeEach(async t => {
  try {
    fs.unlinkSync(path.join(__dirname, 'fhir.json'));
  } catch (ignored) {}
});

test.serial('The report function will save a DiagnosticReport FHIR resource', async t => {
  await report(console, 'project', 'patient', 'https://api.com/v1/files/1234', '2000-01-01', path.join(__dirname, 'fhir.json'));

  const result = fs.readFileSync(path.join(__dirname, 'fhir.json'), 'utf8');
  t.is(result,
    `{"resourceType":"DiagnosticReport","meta":{"tag":[{"system":"http://lifeomic.com/fhir/dataset","code":"project"},{"code":"LifeOmic Task Service","system":"http://lifeomic.com/fhir/source"},{"code":"Ashion","system":"http://lifeomic.com/fhir/report-source"}]},"status":"final","code":{"text":"Ashion GEM ExTra"},"effectiveDateTime":"2000-01-01","subject":{"reference":"Patient/patient"},"result":[],"report":{"presentedForm":[{"url":"https://api.com/v1/files/1234","contentType":"application/pdf","title":"Ashion GEM ExTra"}]}}
`);
});
