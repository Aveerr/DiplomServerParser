import { scrapeMusic } from './parserMp3Beast.js';
import { consola } from 'consola';
import { parseDownloadUrl } from './parseDownloadUrl.js';

/**
 * Parses music from mp3beast
 * @param {string} soundName - Name of the song to search for
 * @returns {Promise<Object[{songTitle: ..., downloadUrl: ...}, {...}]>} Array of music
 */
export async function parseMusic(soundName){
    let results = await scrapeMusic(soundName)
    console.log(results);

    consola.success('Scraping completed');
    consola.info('Getting download url');

    let musicList = await parseDownloadUrl(results);
    
    consola.success('Download url received');
    consola.info('Download url:');
    console.log(musicList);
    return musicList;
}
