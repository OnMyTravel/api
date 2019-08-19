const DomainError = require('./DomainError')

class MultipleErrors extends DomainError {
    constructor() {
        super()
        this.errors = []
    }

    add(error) {
        this.errors.push(error)
    }

    getErrors() {
        return this.errors;
    }

    hasErrors() {
        return this.errors.length > 0
    }
}

module.exports = MultipleErrors;