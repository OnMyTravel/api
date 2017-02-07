const pkgcloud = require('pkgcloud')
const config = require('config')
const fs = require('fs')

function create (tripId) {
  let client = pkgcloud.storage.createClient(config.get('storage'))

  return new Promise((resolve, reject) => {
    client.createContainer({ name: tripId }, (error, container) => {
      if (error) {
        reject(error)
      } else {
        resolve(container)
      }
    })
  })
}

function uploadToStorage (file, tripId) {
  return new Promise((resolve, reject) => {
    let client = pkgcloud.storage.createClient(config.get('storage'))
    let readStream = fs.createReadStream(file.path)

    let writeStream = client.upload({
      container: tripId,
      remote: file.name,
      contentType: file.mime
    })

    readStream.on('error', (err) => {
      reject(err)
    })

    writeStream.on('error', (err) => {
      reject(err)
    })

    writeStream.on('success', (file) => {
      resolve(file)
    })

    readStream.pipe(writeStream)
  })
}

module.exports = { create, uploadToStorage }
