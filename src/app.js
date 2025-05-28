import express from 'express';
import parseRoutes from './routes/post/parseRoutes.js';

const app = express();
app.use(express.json()); // позваляет парсить json
app.use('/api', parseRoutes); // подключает роуты

export default app; 