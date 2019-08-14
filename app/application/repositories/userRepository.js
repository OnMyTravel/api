const { User } = require('../../domain/models')

module.exports = {
    findByEmailAndPassword: (email, password) => User.findOne({ email, password })
}