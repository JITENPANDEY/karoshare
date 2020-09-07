const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const path = require('path');

app.use(express.static('public'));

const connectDB = require('./config/db')
connectDB();

//template Engine
app.set('views',path.join(__dirname,'/views'))
app.set('view engine','ejs');

app.use(express.json());

//Routes
app.use('/api/files',require('./routes/files.js'))
app.use('/files',require('./routes/show.js'))
app.use('/files/download',require('./routes/download.js'))

app.listen(PORT, () => {
    console.log("listening on PORT: ", PORT)
})