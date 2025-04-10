const UAParser = require('ua-parser-js');

exports.parseUserAgent = (userAgentString) => {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();
  
  return {
    deviceType: result.device.type || 'desktop',
    browser: result.browser.name || 'unknown',
    browserVersion: result.browser.version || 'unknown',
    operatingSystem: result.os.name || 'unknown',
    osVersion: result.os.version || 'unknown'
  };
};
