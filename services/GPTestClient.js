const { gatewayURL, gatewayProxyHost } = require('../config');
const axios = require('axios');

function GetUnitTest(func, rapidAPIKey) {
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

module.exports = { GetUnitTest };
