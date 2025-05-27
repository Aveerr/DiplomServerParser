import { consola } from 'consola';
import { getDownloadUrl } from '../../../controllers/getDownloadUrl.js';

export async function parseDownloadUrl(results) {
    let newMusic = [];
    for (const music of results) {
        try {
            let downloadUrl = await getDownloadUrl(music.musicDownload);
            consola.info(`Final download URL: ${downloadUrl}`);
            newMusic.push({
                songTitle: music.songTitle,
                downloadUrl: downloadUrl
            });
        } catch (error) {
            consola.error(`Failed to get download URL for: ${music.songTitle}`, error);
        }
    }
    return newMusic;
}

