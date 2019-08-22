'use strict';

const fs = require('fs');
const path = require('path');
const test = require('ava');
const other = require('../../src/other');

test.beforeEach(async t => {
  try {
    fs.unlinkSync(path.join(__dirname, 'fhir.json'));
  } catch (ignored) {}
});

test.serial('The fnv function will parse an Ashion FNV VCF and convert to CSV', async t => {
  await other(console, 'project', 'patient', 'sequence', '2000-01-01', 'test-1', path.resolve(__dirname, '../data/other.vcf'), path.join(__dirname, 'fhir.json'));

  const result = fs.readFileSync(path.join(__dirname, 'fhir.json'), 'utf8');
  t.is(result,
    `{"effectiveDateTime":"2000-01-01","meta":{"tag":[{"code":"project","system":"http://lifeomic.com/fhir/dataset"},{"code":"LifeOmic Task Service","system":"http://lifeomic.com/fhir/source"},{"code":"tumor-mutation-burden","system":"http://lifeomic.com/fhir/variant-type"},{"code":"Ashion","system":"http://lifeomic.com/fhir/report-source"},{"code":"test-1","system":"http://lifeomic.com/fhir/sequence-test-id"}]},"code":{"coding":[{"code":"TMB","system":"http://lifeomic.com/fhir/biomarker","display":"Tumor Mutation Burden"}]},"component":[{"code":{"coding":[{"code":"TMB Status","system":"http://lifeomic.com/fhir/biomarker","display":"TMB Status"}]},"valueCodeableConcept":{"coding":[{"code":"TMB-L","system":"http://lifeomic.com/fhir/biomarker","display":"low"}]}},{"code":{"coding":[{"code":"TMB Score","system":"http://lifeomic.com/fhir/biomarker","display":"TMB Score"}]},"valueQuantity":{"unit":"mutations-per-megabase","value":1.995575961598978}}],"resourceType":"Observation","subject":{"reference":"Patient/patient"},"status":"final","extension":[{"valueReference":{"reference":"Sequence/sequence"},"url":"http://hl7.org/fhir/StructureDefinition/observation-geneticsSequence"}]}
{"subject":{"reference":"Patient/patient"},"meta":{"tag":[{"code":"project","system":"http://lifeomic.com/fhir/dataset"},{"code":"LifeOmic Task Service","system":"http://lifeomic.com/fhir/source"},{"code":"microsatellite-instability","system":"http://lifeomic.com/fhir/variant-type"},{"code":"Ashion","system":"http://lifeomic.com/fhir/report-source"},{"code":"test-1","system":"http://lifeomic.com/fhir/sequence-test-id"}]},"status":"final","effectiveDateTime":"2000-01-01","valueCodeableConcept":{"coding":[{"display":"Indeterminate","code":"LA11884-6","system":"http://loinc.org"}]},"extension":[{"url":"http://hl7.org/fhir/StructureDefinition/observation-geneticsSequence","valueReference":{"reference":"Sequence/sequence"}}],"resourceType":"Observation","code":{"coding":[{"display":"Microsatellite instability [Interpretation] in Cancer specimen Qualitative.","code":"81695-9","system":"http://loinc.org"}]}}
`);
});
