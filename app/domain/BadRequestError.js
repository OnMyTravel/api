const DomainError = require('./DomainError')

class BadRequestError extends DomainError {
    constructor({
        message
    } = {}) {
        super(message)
    }
}

module.exports = BadRequestError