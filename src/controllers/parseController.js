const post = async (req, res) => {
    try {
        console.log('post');
        const {url, parserType} = req.body;
        switch (parserType) {
            case 'mp3beast':
                console.log('mp3beast');
                res.send();
                break;
                
            default:
                break;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export default {
    post
};