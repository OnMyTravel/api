// 'use strict';
//
// import fs from 'fs';
// import pkgcloud from 'pkgcloud';
// import config from '../../config/environment';
// import Q from 'q';
//
// export function createSession() {
//   var storageClient = pkgcloud.storage.createClient(config.storage);
//
//   return {
//     getTripFolder: function (tripId) {
//       var deferred = Q.defer();
//
//       storageClient.getContainer(tripId, function (err, data) {
//           (err) ? deferred.reject(err) : deferred.resolve(data);
//       });
//
//       return deferred.promise;
//     },
//
//     uploadToStorage: function (tripId, filePath, remoteFilename, mimetype) {
//       var uploadPromise = Q.defer();
//
//       var readStream = fs.createReadStream(filePath);
//       var writeStream = storageClient.upload({
//         container: tripId,
//         remote: remoteFilename,
//         contentType: mimetype
//       });
//
//       fs.access(filePath, fs.R_OK, (err) => {
//         if(err !== null) {
//           uploadPromise.reject(new Error('Unable to locate file'));
//         } else {
//           readStream.pipe(writeStream);
//         }
//       });
//
//       writeStream.on('success', function(file) {
//         uploadPromise.resolve(file);
//       });
//
//       return uploadPromise.promise;
//     }
//   };
// }

const pkgcloud = require('pkgcloud')
const config = require('config')

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

module.exports = { create }
