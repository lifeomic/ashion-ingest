const PDFParser = require('pdf2json');
const pdfParser = new PDFParser();

const TEXT_ARRAY = 'R';
const TEXT_INDEX = 'T';
const LINE_HEIGHT_POSITION = 'y';

const PATIENT_TAG = encodeURIComponent('Patient:');
const DIAGNOSIS_TAG = encodeURIComponent('Diagnosis:');
const DATE_TAG = encodeURIComponent('Date:');
const DOB_TAG = encodeURIComponent('DOB:');
const SITE_TAG = encodeURIComponent('Site:');
const NUMBER_TAG = encodeURIComponent('#:');
const GENDER_TAG = encodeURIComponent('Gender:');
const REPORT_TAG = 'Report';
const SPECIMEN_TAG = 'Specimen';
const MEDICAL_TAG = 'Medical';
const RECORD_TAG = 'Record';

function extractAllTextOnLineAfterIndex (
  page1TextFields,
  lineHeight,
  currentIndex
) {
  const result = [];
  // adding one to the initial index to step pass the tag field
  for (
    currentIndex++;
    lineHeight === page1TextFields[currentIndex][LINE_HEIGHT_POSITION];
    currentIndex++
  ) {
    result.push(page1TextFields[currentIndex][TEXT_ARRAY][0][TEXT_INDEX]);
  }

  return result.join(' ');
}

function parsePdf (input) {
  return new Promise(function (resolve, reject) {
    pdfParser.on('pdfParser_dataError', (errData) => reject(errData));
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      const patientInfo = {};
      let diagnosis = null;

      // we only need the first page so lets narrow down our json
      const page1TextFields = pdfData['formImage']['Pages'][0]['Texts'];
      for (let i = 0; i < page1TextFields.length; i++) {
        const field = page1TextFields[i];
        if (field[TEXT_ARRAY][0][TEXT_INDEX] === PATIENT_TAG) {
          patientInfo.firstName =
            page1TextFields[i + 1][TEXT_ARRAY][0][TEXT_INDEX];
          patientInfo.lastName =
            page1TextFields[i + 2][TEXT_ARRAY][0][TEXT_INDEX];
        } else if (field[TEXT_ARRAY][0][TEXT_INDEX] === DIAGNOSIS_TAG) {
          diagnosis = extractAllTextOnLineAfterIndex(
            page1TextFields,
            field[LINE_HEIGHT_POSITION],
            i
          );
        } else if (
          field[TEXT_ARRAY][0][TEXT_INDEX] === REPORT_TAG &&
          page1TextFields[i + 1][TEXT_ARRAY][0][TEXT_INDEX] === DATE_TAG
        ) {
          patientInfo.indexedDate = decodeURIComponent(
            page1TextFields[i + 2][TEXT_ARRAY][0][TEXT_INDEX]
          );
        } else if (field[TEXT_ARRAY][0][TEXT_INDEX] === DOB_TAG) {
          patientInfo.dob = decodeURIComponent(
            page1TextFields[i + 1][TEXT_ARRAY][0][TEXT_INDEX]
          );
        } else if (
          field[TEXT_ARRAY][0][TEXT_INDEX] === SPECIMEN_TAG &&
          page1TextFields[i + 1][TEXT_ARRAY][0][TEXT_INDEX] === SITE_TAG
        ) {
          patientInfo.bodySite = extractAllTextOnLineAfterIndex(
            page1TextFields,
            field[LINE_HEIGHT_POSITION],
            i + 1
          );
        } else if (
          field[TEXT_ARRAY][0][TEXT_INDEX] === MEDICAL_TAG &&
          page1TextFields[i + 1][TEXT_ARRAY][0][TEXT_INDEX] === RECORD_TAG &&
          page1TextFields[i + 2][TEXT_ARRAY][0][TEXT_INDEX] === NUMBER_TAG
        ) {
          patientInfo.mrn = page1TextFields[i + 3][TEXT_ARRAY][0][TEXT_INDEX];
        } else if (field[TEXT_ARRAY][0][TEXT_INDEX] === GENDER_TAG) {
          patientInfo.gender =
            page1TextFields[i + 1][TEXT_ARRAY][0][TEXT_INDEX];
        }
      }

      return resolve({diagnosis, patientInfo});
    });

    pdfParser.loadPDF(input);
  });
}

module.exports = async (logger, input) => {
  const {diagnosis, patientInfo} = await parsePdf(input);
  logger.info({input}, 'Process patient in from pdf report file');
  return { diagnosis, patientInfo };
};
