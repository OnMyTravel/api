const Mongoose = require('mongoose')
const moment = require('moment')
const sinon = require('sinon')
const expect = require('chai').expect
const {
    Token
} = require('../../../app/domain/models')
const db = require('../../../database')

const tokenRepository = require('../../../app/application/repositories/tokenRepository')

describe('Unit | Application | Repositories | Token', () => {
    const fixedTime = new Date(2017, 6, 12);

    let connexion
    let clock
    beforeEach(() => {
        connexion = db.openDatabaseConnexion()
        clock = sinon.useFakeTimers(fixedTime);
    })

    afterEach(() => {
        clock.restore();
        return Token
            .deleteMany({})
            .then(() => connexion.close())
    })

    describe(':create', () => {
        it('should persist a new token', () => {
            // Given
            const userId = Mongoose.Types.ObjectId()
            const expirationDate = moment.utc({
                year: 2019,
                month: 11,
                day: 30,
                hour: 15,
                minute: 10,
                second: 3,
                millisecond: 123
            }); 

            // When
            const query = tokenRepository.create({
                userId,
                expirationDate
            })

            // Then
            return query
                .then(() => Token.countDocuments())
                .then((count) => {
                    expect(count).to.equal(1)
                })
        })

        it('should generate a key and an experimentation date for the user', () => {
            // Given
            const userId = Mongoose.Types.ObjectId()
            const expirationDate = moment.utc({
                year: 2019,
                month: 11,
                day: 30
            }).toDate();

            // When
            const query = tokenRepository.create({
                userId,
                expirationDate
            })

            // Then
            return query
                .then(() => Token.findOne())
                .then((token) => {

                    expect(token.userId).to.deep.equal(userId)
                    expect(token).to.have.deep.property('expirationDate', expirationDate)
                    expect(token).to.have.property('isExpired').that.is.false
                    expect(token).to.have.property('key').that.match(/[a-z0-9]{48}/)
                });
        })

        it('should save the creation date', () => {
            // Given
            const userId = Mongoose.Types.ObjectId()
            const expirationDate = moment.utc({}).toDate();
            const now = new Date(2016, 5, 2);

            // When
            const query = tokenRepository.create({
                userId,
                expirationDate
            })

            // Then
            return query
                .then(() => Token.findOne())
                .then((token) => {
                    expect(token).to.have.deep.property('creationDate', fixedTime)
                })
        })
    })

    describe(':updateByKey', () => {
        const key = 'user-key'

        beforeEach(() => {
            const userId = Mongoose.Types.ObjectId()
            const expirationDate = new Date(2100, 7, 12)
            const isExpired = false;
            return Token.create({
                userId,
                key,
                expirationDate,
                isExpired
            })
        })

        it('should update the data', async () => {
            // Given
            const newExpirationDate = new Date(2000, 2, 21);

            // When
            await tokenRepository.updateByKey(key, { isExpired: true, expirationDate: newExpirationDate })
            
            // Then
            return Token.findOne({ key })
            .then((token) => {
                expect(token).to.have.property('isExpired', true)
                expect(token).to.have.deep.property('expirationDate', newExpirationDate)
            })
        })
    })
})