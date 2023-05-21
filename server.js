const express = require('express')
const fileUpload = require('express-fileupload')
const pdfParse = require('pdf-parse')
const mongoose = require('mongoose')
require("dotenv").config()
const bodyParser = require('body-parser')
mongoose.set('strictQuery', false)
const cors = require('cors')
const multer = require('multer');
const path = require('path')



const util = require('util')
const morgan = require('morgan')
app = express()
app.use(cors())

// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});



mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("db connected");
    }).catch(() => {
        console.log("errr");
    });

app.use(express.json())
app.use(express.urlencoded({ extended: true }))



app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'upload')))
app.use(express.static('upload'));
app.use('/documents', express.static(__dirname + '/documents/'));
app.use('/upload', express.static(__dirname + '/upload/'));
app.use('/cv', express.static(__dirname + '/cv/'));
app.use('/contrat', express.static(__dirname + '/contrat/'));

app.use(express.urlencoded({ extended: true }))
app.use(morgan('tiny'))

const port = process.env.port
app.listen(port, () => {
    console.log(`connected at ${port}  `);
})

app.use((err, req, res, next) => {
    console.log(util.inspect(err, { compact: false, depth: 5, breakLength: 80, colors: true }));
    res.status(500).redirect('/')
})
//define routes
app.use('/api/user', require('./router/router'))
app.use('/api/admin', require('./router/adminRouter'));


