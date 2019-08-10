const MultipleErrors = require('../MultipleErrors')
const BadRequestError = require('../BadRequestError')

const authenticateWithCredentials = ({ payload } = {}) => {
    const { email, password } = payload;

    const multipleError = new MultipleErrors()

    if(!email)
        multipleError.add(new BadRequestError({ message: 'No email received' }))

    if(!password)
        multipleError.add(new BadRequestError({ message: 'No password received' }))

    throw multipleError;
}

module.exports = authenticateWithCredentials