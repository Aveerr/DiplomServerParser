const axios = require('axios');

axios.post('http://localhost:3000/api/parse', {
  url: 'https://example.com',
  parserType: "mp3beast"
})
  .then(response => console.log(response.data))
  .catch(error => console.error('Ошибка:', error.message));