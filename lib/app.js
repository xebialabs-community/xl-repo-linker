var bodyParser = require('body-parser');
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var app = module.exports = express();
app.use(cookieParser());
app.use(session({
    secret: 'xl repo linker',
    saveUninitialized: true,
    resave: false
}));

app.use(express.static('../web'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

