import { scrapeMusic } from './parserMp3Beast.js';
import { consola } from 'consola';
import { parseDownloadUrl } from './parseDownloadUrl.js';

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
