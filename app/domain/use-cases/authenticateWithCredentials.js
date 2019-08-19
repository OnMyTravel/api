const MultipleErrors = require('../MultipleErrors')
const BadRequestError = require('../BadRequestError')

const _checkPayloadIsValid = (payload) => {
    const { email, password } = payload;

    const multipleError = new MultipleErrors()

    if(!email)
        multipleError.add(new BadRequestError({ message: 'No email received' }))

    if(!password)
        multipleError.add(new BadRequestError({ message: 'No password received' }))

    if(multipleError.hasErrors())
        throw multipleError;
}


const authenticateWithCredentials = ({ payload } = {}, { tokenRepository, userRepository } = {}) => {
    const { email, password } = payload;

    _checkPayloadIsValid(payload)

    return userRepository.findByEmailAndPassword(email, password)
        .then((user) => {
            
            if(user)
                return tokenRepository.create({ userId: user.get('id') })

            return Promise.reject(new BadRequestError({ message: 'No account found for these credendials' }))
        })
        .then((token) => {
            return {
                token: token.key
            }
        })
}

module.exports = authenticateWithCredentials