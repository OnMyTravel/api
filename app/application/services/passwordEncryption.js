const crypto = require('crypto');
const config = require('config')

module.exports = (string) => {
    return crypto.createHmac('sha512', config.app.passwordSecret)
        .update(string)
        .digest('hex');
}