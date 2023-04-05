const { gatewayURL, gatewayProxyHost } = require('../config');
const { rapidAPIKey } = require('../utils/Constants');
const axios = require('axios');

function getUnitTest(func) {
  return axios
    .post(
      `${gatewayURL}/api/v0/unit-test-generation`,
      {
        code: func,
      },
      {
        headers: {
          'X-RapidAPI-Key': rapidAPIKey,
          'X-RapidAPI-Host': gatewayProxyHost,
        },
      }
    )
    .catch((error) => {
      console.log('Error: ' + error);
      throw new Error(error);
    });
}

module.exports = { getUnitTest };
