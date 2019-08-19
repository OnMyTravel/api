const expect = require('chai').expect

const serializer = require('../../app/application/serializers/domainErrorsSerializer.js')
const BadRequestError = require('../../app/domain/BadRequestError')
const MultipleErrors = require('../../app/domain/MultipleErrors')

describe('Unit | Serializer | Domain errors', () => {
  describe('out', () => {
    describe('BadRequestError', () => {
        it('should have the right format', () => {
            // Given
            const error = new BadRequestError({ message: 'The email is missing' })
            
            // When
            const result = serializer(error)

            // Then
            expect(result).to.deep.equal({
                errors: [{
                    code: '400',
                    title: 'The email is missing'
                }]
            })
        })
        
        it('should use the message', () => {
            // Given
            const error = new BadRequestError({ message: 'The password is missing' })
            
            // When
            const result = serializer(error)

            // Then
            expect(result).to.deep.equal({
                errors: [{
                    code: '400',
                    title: 'The password is missing'
                }]
            })
        })
    })
    
    describe('MultipleErrors', () => {
        it('should have the right format', () => {
            // Given
            const error = new MultipleErrors()
            error.add(new BadRequestError({ message: 'The email is missing' }))
            error.add(new BadRequestError({ message: 'The passsword is missing' }))

            // When
            const result = serializer(error)

            // Then
            expect(result).to.deep.equal({
                errors: [{
                    code: '400',
                    title: 'The email is missing'
                },{
                    code: '400',
                    title: 'The passsword is missing'
                }]
            })
        })
    })
  })
})
