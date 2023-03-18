const express = require('express')
const mongoose = require('mongoose')
require("dotenv").config()
const bodyParser = require('body-parser')
mongoose.set('strictQuery', false)
const Profile = require('./models/profile.model')
const cors = require('cors')
const multer = require('multer');
const path = require('path')


const util = require('util')
const morgan = require('morgan')
app = express()
app.use(cors())



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
app.use('/upload', express.static(__dirname + '/upload/'));
app.use('/cv', express.static(__dirname + '/cv/'));

app.use(express.urlencoded({ extended: true }))
app.use(morgan('tiny'))
const port = process.env.port
app.listen(port, () => {
    console.log(`connected at ${port}  `);
})
app.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find({}).exec()
        console.log(profiles);
        const profil = profiles && profiles.length ? profiles[0] : null
        res.render('index', { profil })

    } catch (error) {
        console.log(error);
    }
})


app.use((err, req, res, next) => {
    console.log(util.inspect(err, { compact: false, depth: 5, breakLength: 80, colors: true }));
    res.status(500).redirect('/')
})
//define routes
app.use('/api/user', require('./router/router'))
