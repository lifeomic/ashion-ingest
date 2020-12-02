const fs = require('fs');
const YAML = require('yamljs');

module.exports = async (input, pcann, cancerScope) => {
  const parsed = YAML.load(input);
  const pcannJson = JSON.parse(fs.readFileSync(pcann));
  const cancerScopeJson = JSON.parse(fs.readFileSync(cancerScope));
  parsed.tests[0].tumorTypePredictions = [];

  if (pcannJson.Result && pcannJson.Result.length > 0) {
    const result = pcannJson.Result[0];

    parsed.tests[0].tumorTypePredictions.push(
      {
        label: result.PredictLabel,
        confidence: parseFloat(result.PredictConfidence, 10),
        source: 'PCANN',
        details: JSON.stringify(result.Neighbors)
      }
    );
  }

  if (cancerScopeJson.predictions && cancerScopeJson.predictions) {
    parsed.tests[0].tumorTypePredictions.push(
      {
        label: cancerScopeJson.predictions[0].cancerscope_label,
        confidence: parseFloat(cancerScopeJson.predictions[0].pred),
        source: 'CancerScope',
        details: JSON.stringify(cancerScopeJson.predictions)
      }
    );
  }

  const finalFileName = input.replace('.tmp', '.yml');
  fs.writeFileSync(finalFileName, YAML.stringify(parsed, 4));
};
