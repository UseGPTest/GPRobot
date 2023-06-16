const { repositoryName } = require('../utils/Constants');
const { api } = require('./api');

async function getUnitTest(func, contextCode) {
  const data = JSON.stringify({
    code: func,
    contextCode,
  });

  try {
    const response = await api.post('/unit-test-generation', {
      data: data,
      headers: {
        'Content-Type': 'application/json',
        'X-Repository-Name': repositoryName,
      }
    })
    console.log(`GPTestClient resolving with response= ${response.data}`);
    return response.data;
  } catch (error) {
    console.log('GPTestClient Error ' + error);
    throw error;
  }
}

module.exports = { getUnitTest };
