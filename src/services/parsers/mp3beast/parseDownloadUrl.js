import { consola } from 'consola';
import { getDownloadUrl } from '../../../controllers/getDownloadUrl.js';

export async function parseDownloadUrl(results) {
    const startTime = Date.now();
    try {
        // Extract all download URLs
        const downloadUrls = results.map(music => music.musicDownload);
        
        // Get all download URLs concurrently
        const finalDownloadUrls = await getDownloadUrl(downloadUrls);
        
        // Map the results back to the original format
        const newMusic = results.map((music, index) => ({
            musicLogo: music.musicLogo,
            musicLength: music.musicLength,
            songTitle: music.songTitle,
            downloadUrl: finalDownloadUrls[index]
        }));

        const endTime = Date.now();
        const processingTime = (endTime - startTime) / 1000;
        consola.success(`Total processing time for ${results.length} songs: ${processingTime.toFixed(2)}s`);

        return newMusic;
    } catch (error) {
        const endTime = Date.now();
        const processingTime = (endTime - startTime) / 1000;
        consola.error(`Failed to get download URLs (Time: ${processingTime.toFixed(2)}s):`, error);
        throw error;
    }
}

