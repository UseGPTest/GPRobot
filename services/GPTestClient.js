const http = require('http');
const { gatewayURL, gatewayProxyHost } = require('../config');
const { rapidAPIKey } = require('../utils/Constants');

function getUnitTest(func, contextCode) {
  const data = JSON.stringify({
    code: func,
    contextCode,
  });

  const options = {
    hostname: gatewayURL,
    path: '/api/v0/unit-test-generation',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': rapidAPIKey,
      'X-RapidAPI-Host': gatewayProxyHost,
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let chunks = '';
      res.on('data', (chunk) => {
        chunks += chunk;
      });
      res.on('end', () => {
        resolve(JSON.parse(chunks));
      });
    });
    req.on('error', (error) => {
      console.error('Error: ' + error);
      reject(error);
    });
    req.write(data);
    req.end();
  });
}

module.exports = { getUnitTest };