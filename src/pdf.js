const fs = require('fs');
const pdf = require('pdf-parse');

module.exports = async (logger, input) => {
  const buffer = fs.readFileSync(input);
  const patientInfo = {};
  let diagnosis = null;
  const data = await pdf(buffer, { max: 1 });

  for (const line of data.text.split('\n')) {
    const diagnosisLine = line.match(/^Diagnosis:(.*)/);
    if (diagnosisLine) {
      diagnosis = diagnosisLine[1].trim();
    }

    const reportLine = line.match(/^Report\s*Date:(.*)/);
    if (reportLine) {
      patientInfo.indexedDate = reportLine[1].trim();
    }
    const nameLine = line.match(/Patient:(.*)Ordering\s*Client:(.*)/);
    if (nameLine) {
      const [first, last] = nameLine[1].trim().split(' ');
      patientInfo.firstName = first.trim();
      patientInfo.lastName = last.trim();
    }
    const dobSpecLine = line.match(/DOB:(.*)Specimen\s*Site:(.*)/);
    if (dobSpecLine) {
      patientInfo.dob = dobSpecLine[1].trim();
      patientInfo.bodySite = dobSpecLine[2].trim().replace(/([a-zA-Z])(?=[A-Z])/g, '$1 ');
    }

    const dobLine = line.match(/DOB:(.*)/);
    if (dobLine && !patientInfo.dob) {
      patientInfo.dob = dobLine[1].trim();
    }

    const specLine = line.match(/Specimen\s*Site:(.*)/);
    if (specLine && !patientInfo.bodySite) {
      patientInfo.bodySite = specLine[1].trim().replace(/([a-zA-Z])(?=[A-Z])/g, '$1 ');
    }

    const mrnLine = line.match(/Medical\s*Record\s*#:(.*)Tumor\s*Collection\s*Date:(.*)/) ||
          line.match(/Medical\s*Record\s*#:(.*)/);
    if (mrnLine) {
      patientInfo.mrn = mrnLine[1].trim();
    }
    const genderLine = line.match(/Gender:(.*)Specimen\s*(Type|Site):(.*)/);
    if (genderLine) {
      patientInfo.gender = genderLine[1].trim();
    }
  }

  logger.info({input}, 'Process patient in from pdf report file');

  return { diagnosis, patientInfo };
};
