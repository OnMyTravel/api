const crypto = require('crypto')
const {
    Token
} = require('../../domain/models')

module.exports = {
    create: ({
        userId,
        expirationDate
    }) => {
        const TOKEN_SIZE = 48;
        const key = crypto.randomBytes(TOKEN_SIZE).toString('hex');

        return new Token({
            userId,
            expirationDate,
            key,
            creationDate: Date.now()
        }).save()
    },

    updateByKey: (key, {
        isExpired, expirationDate
    }) => {
        return Token.updateOne({
            key,
        }, {
            $set: {
                isExpired,
                expirationDate
            }
        })
    }
}