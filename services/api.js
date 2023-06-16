const axios = require('axios');
const api = axios.create({
  baseURL: 'https://gptest.onrender.com/api/v0',
});

module.exports = { api };