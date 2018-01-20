let mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

let config = require('config');

let pjson = require('./package.json');
let api = require('./app');

const options = {
    useMongoClient: true,
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
};

mongoose.connect(config.database.host, options);
let db = mongoose.connection;

// Once the connexion is failed
db.on('error', console.error.bind(console, 'Database error:'));

// Once the connexion is opened
db.on('open', () => {
    api.listen(config.app.port, function() {
        console.log(pjson.name + ': running on port ' + config.app.port);
    });
});



module.exports = api;
