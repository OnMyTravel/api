const useCases = require('./../../domain/use-cases')
const passwordEncryption = require('./../../application/services/passwordEncryption')
const tokenRepository = require('./../../application/repositories/tokenRepository')
const userRepository = require('./../../application/repositories/userRepository')

module.exports = {
    authenticateWithCredentials: (req, res, next) => {
        let payload = req.body;
        if(payload.password) {
            payload = Object.assign(payload, {
                password: passwordEncryption(payload.password)
            });
        }

        return useCases.authenticateWithCredentials({
            payload: payload
        }, { tokenRepository, userRepository })
        .then((token) => {
            res.status(201).json(token)
        })
        .catch(next)
    }
}