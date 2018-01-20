const fs = require('fs');
const config = require('config');
const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(bodyParser.json());

if (config.get('app.logs.enabled')) {
    var accessLogStream = fs.createWriteStream(config.get('app.logs.path'), { flags: 'a+' })
    app.use(morgan('combined', { stream: accessLogStream }))
}

const pjson = require('../package.json');

app.use('/trips', require('./trips/routes'));
app.use('/trips/:tripid/steps', require('./steps/routes'));
app.use('/users', require('./users/routes'));

app.get('/', function(req, res) {
    res.json({ description: pjson.description, version: pjson.version })
});

module.exports = app;
