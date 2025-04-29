const express = require('express');
const parseRoutes = require('./routes/post/parseRoutes')

const app = express();
app.use(express.json());
app.use('/api', parseRoutes)
module.exports = app; 