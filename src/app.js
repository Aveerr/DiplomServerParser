import express from 'express';
import parseRoutes from './routes/post/parseRoutes.js';
import rateLimit from 'express-rate-limit';

const app = express();

// Configure rate limiting
const limiter = rateLimit({
    windowMs: 20 * 1000, // 20 seconds
    max: 1, // Limit each IP to 1 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
app.use(limiter);

app.use(express.json()); // позваляет парсить json
app.use('/api', parseRoutes); // подключает роуты

export default app; 