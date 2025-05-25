import express from 'express';
import parseRoutes from './routes/post/parseRoutes.js';

const app = express();
app.use(express.json());
app.use('/api', parseRoutes);

export default app; 