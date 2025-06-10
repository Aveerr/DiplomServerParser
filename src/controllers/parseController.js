import consola from 'consola';
import { parseMusic } from '../services/parsers/mp3beast/parseMusic.js';

const get = async (req, res) => {
    try {
        consola.info(req.body);
        const {songName, parserType} = req.body;

        switch (parserType) {
            case 'mp3beast':
                const results = await parseMusic(songName);
                res.status(200).json({
                    message: 'success',
                    results
                });
                break;
                
            default:
                res.status(400).json({
                    songName: 'songName',
                    parserType: 'parserType like mp3beast'
                });
                break;
        }
    } catch (err) {
        res.status(500).json({ 
            error: err.message 
        });
    }
};

export default {
    get
};