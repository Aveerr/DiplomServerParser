import express from 'express';
import parseController from '../../controllers/parseController.js';

const router = express.Router(); 
router.get('/parse', parseController.get); // подключаем метод post из parseController и присваиваем ему роут /parse

export default router;