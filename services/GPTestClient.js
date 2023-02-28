const axios = require('axios');

function GetUnitTest(func) {
  return axios.post('https://gptest-api.onrender.com/api/v0/unit-test-generation', func)
  .catch((error) => {
    console.log("Error: " + error);
    throw new Error(error);
  });
}

module.exports = { GetUnitTest };