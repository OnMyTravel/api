const config = require('config');
const pjson = require('./package.json');
const api = require('./app');

const { openDatabaseConnexion } = require('./database');

const db = openDatabaseConnexion()
// Once the connexion is failed
db.on('error', (err) => {
    console.error(err);
});

// Once the connexion is opened
db.on('open', () => {
    api.listen(config.app.port, function() {
        console.log(pjson.name + ': running on port ' + config.app.port);
    });
});

module.exports = api;