const express = require('express')
const app = express()
const session = require('express-session')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan');
const path = require('path')

app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const port = process.env.PORT || 2050

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'build')));

app.use(session({
    secret: 'greendeck',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 1 Day
}))

mongoose.connect('<MONGODB_URI>', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Mongo Connected!'))
    .catch(err => console.log(err))

app.use('/user', require('./server/user'))
app.use('/dashboard', require('./server/dashboard'))
app.use('/subscriptions', require('./server/subscription'))

app.use(morgan('tiny'));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
    console.log('Listening on PORT: ' + port)
})
