const mongoose = require('mongoose')
const config = require('config')

const options = {
  autoIndex: false, // Don't build indexes
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  useNewUrlParser: true
}

module.exports = {
  openDatabaseConnexion: () => {
    mongoose.connect(config.database.host, options)
    mongoose.set('useFindAndModify', false);

    return mongoose.connection
  }
}
