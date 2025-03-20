const config = require('openmrs/default-webpack-config');
config.scriptRuleConfig.exclude = /(node_modules(?![\/\\]@(?:csaude|openmrs|ohri)))/;
// Temporary fix to resolve webpack issues with imports from the libraries below
config.overrides.resolve = {
  extensions: ['.tsx', '.ts', '.jsx', '.js', '.scss'],
  alias: {
    '@csaude/esm-form-engine-lib': '@csaude/esm-form-engine-lib/src/index',
  },
};
module.exports = config;
