const mongoose = require('mongoose')
const expect = require('chai').expect
const Faker = require('faker')

const TripSerializer = require('../../app/serializers/TripSerializer')

const { Trip, Day } = require('../../app/models/index')

describe('Unit | Serializer | Trip', () => {
  describe('serialize', () => {
    it('should transform a Trip object into JSONApi', () => {
      // given
      const description = Faker.lorem.sentence()
      const destination = Faker.lorem.sentence()
      const userId = mongoose.Types.ObjectId()
      const name = Faker.lorem.sentence()
      const dayOne = new Day({})
      const dayTwo = new Day({})
      const trip = new Trip({
        name, description, destination, owner_id: userId
      })

      // when
      const serializedDay = TripSerializer.serialize(trip, [dayOne, dayTwo])

      // then
      expect(serializedDay).to.deep.equal({
        'data': {
          'type': 'trips',
          'id': `${trip.id}`,
          'attributes': {
            description, name, destination
          },
          'relationships': {
            'days': {
              'data': [
                { type: 'days', id: dayOne._id.toString() },
                { type: 'days', id: dayTwo._id.toString() }
              ]
            },
            'user': {
              'data': { type: 'users', id: userId.toString() }
            }
          }
        }
      })
    })

    it('should not fail when no days given', () => {
      // given
      const description = Faker.lorem.sentence()
      const name = Faker.lorem.sentence()
      const userId = mongoose.Types.ObjectId()
      const trip = new Trip({
        name, description, owner_id: userId
      })

      // when
      const serializedDay = TripSerializer.serialize(trip)

      // then
      expect(serializedDay).to.deep.equal({
        'data': {
          'type': 'trips',
          'id': `${trip.id}`,
          'attributes': {
            description, name
          },
          'relationships': {
            'days': {
              'data': []
            },
            'user': {
              'data': { type: 'users', id: userId.toString() }
            }
          }
        }
      })
    })
  })
})
