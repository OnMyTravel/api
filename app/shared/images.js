const ExifImage = require('exif')
const GPSError = require('./errors').GPSError

function getCoordinates (filePath) {
  return new Promise((resolve, reject) => {
    try {
      ExifImage({ image: filePath }, function (error, exifData) {
        if (error) {
          reject(new GPSError(error.message))
        } else {
          let coordinates = {}

          coordinates.GPSLatitudeRef = exifData.gps.GPSLatitudeRef
          coordinates.GPSLatitude = exifData.gps.GPSLatitude
          coordinates.GPSLongitudeRef = exifData.gps.GPSLongitudeRef
          coordinates.GPSLongitude = exifData.gps.GPSLongitude
          coordinates.GPSAltitudeRef = exifData.gps.GPSAltitudeRef
          coordinates.GPSAltitude = exifData.gps.GPSAltitude

          resolve(coordinates)
        }
      })
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = { getCoordinates }
