import { scrapeMusic } from './src/services/parsers/mp3beast/parserMp3Beast.js';

const soundName = 'Metalica';

scrapeMusic(soundName)
  .then(results => console.log('Final results:', results))
  .catch(error => console.error('Fatal error:', error));
