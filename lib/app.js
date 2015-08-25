var bodyParser = require('body-parser');
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var path = require('path');

var app = module.exports = express();
app.use(cookieParser());
app.use(session({
    secret: 'xl repo linker',
    saveUninitialized: true,
    resave: false
}));

app.use(express.static(path.join(__dirname, '../web')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

