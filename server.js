const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const path = require('path');
const cors = require('cors');
// Cors 
const corsOptions = {
    origin:['https://localhost:3000','https://karoshare.herokuapp.com']
    // ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:3300']
}

// Default configuration looks like
// {
//     "origin": "*",
//     "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
//     "preflightContinue": false,
//     "optionsSuccessStatus": 204
//   }

app.use(cors(corsOptions))
app.use(express.static('public'));

const connectDB = require('./config/db')
connectDB();

//template Engine
app.set('views',path.join(__dirname,'/views'))
app.set('view engine','ejs');

app.use(express.json());


app.get('/', (req, res) => {
    res.render('home')
})
//Routes
app.use('/api/files',require('./routes/files.js'))
app.use('/files',require('./routes/show.js'))
app.use('/files/download',require('./routes/download.js'))

app.listen(PORT, () => {
    console.log("listening on PORT: ", PORT)
})