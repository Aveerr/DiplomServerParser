import dotenv from 'dotenv';
import app from './app.js';
import consola from 'consola';

dotenv.config();

const PORT = process.env.PORT || 3000;

// просто запуск сервера
app.listen(PORT, '0.0.0.0', () => {
    consola.info(`Сервер запущен на ${PORT}`);
});