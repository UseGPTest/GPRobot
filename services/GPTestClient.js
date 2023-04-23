const https = require('https');
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
    const req = https.request(options, (res) => {
      let chunks = '';
      res.on('data', (chunk) => {
        chunks += chunk;
      });
      res.on('end', () => {
        console.log(`GPTestClient resolving with response= ${chunks}`);
        response = JSON.parse(chunks);
        resolve(response);
      });
    });
    req.on('error', (error) => {
      console.log('GPTestClient Error ' + error)
      reject(error);
    });
    req.write(data);
    console.log(`GPTestClient Sending Request. code= ${func} contextCode= ${contextCode}`);
    req.end();
  });
}

module.exports = { getUnitTest };