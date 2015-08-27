var path = require('path');

var extend = require('lodash/object/extend');
var defaults = require('lodash/object/defaults');

var collectorConfig = require('../config');

function getConfig() {
  var config = {};

  try {
    var configPath = collectorConfig.configPath ||
      path.join(__dirname, '../../../../../', 'trace.config.js');
    var configToExtend = require(configPath);
    config = extend({}, configToExtend);
  } catch (ex) {
  }

  // we have no config file, let's try with ENV variables
  var reporterType = collectorConfig.reporterType;
  var reporterConfigString = collectorConfig.reporterConfig;
  var reporterConfig;
  if (reporterConfigString) {
    try {
      reporterConfig = JSON.parse(reporterConfigString);
    } catch (parseError) {
      console.warn('Malformed reporter config JSON');
    }
  }

  var index = ['logstash', 'trace'].indexOf(reporterType);
  if (reporterType && reporterConfig && index !== -1) {
    config.reporter = require('../reporters')[reporterType].create(reporterConfig);
  }

  config = defaults({}, collectorConfig, config);

  //check if everything is ok with config
  if (!config.appName) {
    throw new Error('Missing appName');
  }

  if (!config.reporter) {
    throw new Error('Missing reporter, we cannot send the report');
  }

  return config;
}

module.exports.getConfig = getConfig;