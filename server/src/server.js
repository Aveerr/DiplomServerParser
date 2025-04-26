require('dotenv').config()
const app = require('app')

app.listen(process.env.PORT || 3000, () => {
    console.log(`Сервер запущен на ${process.env.PORT}`)
})