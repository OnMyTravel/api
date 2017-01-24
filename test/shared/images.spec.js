const config = require('config')
const shared = require(config.get('app-folder') + '/shared')
const chai = require('chai')
const expect = require('chai').expect
chai.should()

describe('shared', () => {
  describe('images', () => {
    it('checks sanity', () => {
      shared.should.have.property('images')
    })

    describe(':getCoordinates', () => {
      it('checks sanity', () => {
        shared.images.should.have.property('getCoordinates')
      })

      it('should return a rejected promise when the file is not found', (done) => {
        // when
        shared.images
          .getCoordinates('./fileThatDoesNotExist.jpg')
          .then(() => {
            done(new Error('should not be a success'))
          }, () => {
            done()
          })
      })

      it('should return GPS coordinates', (done) => {
        shared.images
          .getCoordinates('./test/shared/starWithGPS.jpg')
          .then((coordinates) => {
            coordinates.should.have.property('GPSLatitudeRef')
            coordinates.should.have.property('GPSLatitude')
            coordinates.should.have.property('GPSLongitudeRef')
            coordinates.should.have.property('GPSLongitude')
            coordinates.should.have.property('GPSAltitudeRef')
            coordinates.should.have.property('GPSAltitude')

            coordinates.GPSLatitudeRef.should.equal('N')
            coordinates.GPSLatitude.should.deep.equal([ 48, 51, 20.36 ])
            coordinates.GPSLongitudeRef.should.equal('E')
            coordinates.GPSLongitude.should.deep.equal([ 2, 16, 12.6 ])
            coordinates.GPSAltitudeRef.should.equal(0)
            coordinates.GPSAltitude.should.equal(42.93607305936073)

            done()
          }, () => {
            done(new Error('should not be a success'))
          })
      })

      it('should return an empty object when there are no GPS coordinates', (done) => {
        shared.images
          .getCoordinates('./test/shared/starWithoutGPS.jpg')
          .then((coordinates) => {
            expect(coordinates.GPSLatitudeRef).to.be.undefined
            expect(coordinates.GPSLatitude).to.be.undefined
            expect(coordinates.GPSLongitudeRef).to.be.undefined
            expect(coordinates.GPSLongitude).to.be.undefined
            expect(coordinates.GPSAltitudeRef).to.be.undefined
            expect(coordinates.GPSAltitude).to.be.undefined

            done()
          }, () => {
            done(new Error('should not be a success'))
          })
      })
    })
  })
})
