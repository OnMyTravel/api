const sinon = require('sinon')

const { Token } = require('../app/domain/models')

const cleanDatabase = () => {
    return Promise
        .all([ 
            Token.deleteMany({})
        ])
};

module.exports = {
    cleanDatabase
}