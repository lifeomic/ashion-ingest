'use strict';

const path = require('path');
const test = require('ava');
const pdf = require('../../src/pdf');

test.serial('The pdf function should parse patient info from the report file', async t => {
  const result = await pdf(console, path.resolve(__dirname, '../data/ashion-report.pdf'));

  t.deepEqual(result, {
    bodySite: 'Colon',
    dob: '10/01/1980',
    firstName: 'John',
    gender: 'Male',
    indexedDate: '10/10/2019',
    lastName: 'Jones',
    mrn: 'MRN1234'
  });
});
