import express from 'express';
import parseController from '../../controllers/parseController.js';

const router = express.Router(); 
router.post('/parse', parseController.post); // подключаем метод post из parseController и присваиваем ему роут /parse

export default router;