const Mongoose = require('mongoose')
const moment = require('moment')
const sinon = require('sinon')
const expect = require('chai').expect
const {
    User
} = require('../../../app/domain/models')
const db = require('../../../database')

const userRepository = require('../../../app/application/repositories/userRepository')

describe('Unit | Application | Repositories | User', () => {
    let connexion
    beforeEach(() => {
        connexion = db.openDatabaseConnexion()
    })

    afterEach(() => {
        return User
            .deleteMany({})
            .then(() => connexion.close())
    })

    describe(':findByEmailAndPassword', () => {
        const email = 'user@example.net';
        const password = '88b18c9s42u3156i4552b8946974c362s15651466ui';

        beforeEach(() => {
            return User.create({ email: email, password })
        })

        it('checks sanity', () => {
            expect(userRepository).to.have.property('findByEmailAndPassword')
            expect(userRepository.findByEmailAndPassword).to.be.a('function')
        })

        it('should return the user when found by email and password', async () => {
            // When
            const user = await userRepository.findByEmailAndPassword(email, password)

            // Then
            expect(user).to.have.property('email').that.equal(email)
        })

        it('should return null when email not found', async () => {
            // When
            const user = await userRepository.findByEmailAndPassword('not-fount-user@example.net', password)

            // Then
            expect(user).to.be.null
        })

        it('should return null when email not found', async () => {
            // When
            const user = await userRepository.findByEmailAndPassword(email, 'wrong-password')

            // Then
            expect(user).to.be.null
        })
    })
})