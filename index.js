const express = require('express');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const path = require('path')

const userRouter = require('./routes/user')

const app = express()
app.use(session({
    secret: 'Work Harder',
    resave: false,
    saveUninitialized: true
}))
app.use(express.static('public'))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))



const dbUrl = 'mongodb://localhost/dreamlist'
mongoose.connect(dbUrl, {useNewUrlParser:true})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use('/user',userRouter)




app.listen((3000), () => {
    console.log(`App is LIVE`);
});