const authenticateWithCredentials = require('./../../domain/use-cases/authenticateWithCredentials')

module.exports = {
    authenticateWithCredentials: (req) => {
        authenticateWithCredentials({ payload: req.body })
    }
}