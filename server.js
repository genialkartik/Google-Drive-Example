const express = require('express')
const app = express()
const session = require('express-session')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan');

const config = require('./config/key')

// const passportSetup = require('./config/passport-setup')

app.use(cors());

const port = process.env.PORT || 2050

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(session({
    secret: 'greendeck',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 1 Day
}))

mongoose.connect(config.mongoURI, {
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

app.listen(port, () => {
    console.log('Listening on PORT: ' + port)
})