const fs = require('fs')
const config = require('config')
const pkgcloud = require('pkgcloud')
const ContainerError = require('./errors').ContainerError

function create (tripId) {
  let client = pkgcloud.storage.createClient(config.get('storage'))

  return new Promise((resolve, reject) => {
    client.createContainer({ name: tripId }, (error, container) => {
      if (error) {
        reject(new ContainerError(error.message))
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
      reject(new ContainerError(err.message))
    })

    writeStream.on('error', (err) => {
      reject(new ContainerError(err.message))
    })

    writeStream.on('success', (file) => {
      resolve(file)
    })

    readStream.pipe(writeStream)
  })
}

function download (tripId, filename, response) {
  let client = pkgcloud.storage.createClient(config.get('storage'))

  client.download({
    container: tripId,
    remote: filename,
    stream: response
  })
}

function deleteFile (tripId, imageId) {
  return new Promise(function (resolve, reject) {
    let client = pkgcloud.storage.createClient(config.get('storage'))

    client.removeFile(tripId, imageId, function (err, result) {
      if (err) {
        reject(new ContainerError(err.message))
      } else {
        resolve()
      }
    })
  })
}

function destroy (tripId) {
  return new Promise((resolve, reject) => {
    let client = pkgcloud.storage.createClient(config.get('storage'))
    client.destroyContainer(tripId, function (err, container) {
      if (err) {
        reject(new ContainerError(err.message))
      } else {
        resolve()
      }
    })
  })
}

module.exports = { create, uploadToStorage, download, deleteFile, destroy }
