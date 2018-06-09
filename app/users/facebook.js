let Client = require('node-rest-client').Client
let Promise = require('bluebird')

const facebookApiBaseUrl = 'https://graph.facebook.com'
const facebookApiVersion = 'v2.8'

function getUserDetails (token) {
  return new Promise((resolve, reject) => {
    const client = new Client({
      // proxy: {
      //   host: '192.168.50.13',
      //   port: 8080,
      //   tunnel: true
      // }
    })

    const args = {
      headers: { 'Authorization': 'Bearer ' + token },
      requestConfig: { timeout: 2000 },
      responseConfig: { timeout: 2000 }
    }

    client.get(facebookApiBaseUrl + '/' + facebookApiVersion + '/me?fields=id%2Cname%2Cemail', args,
      (data, response) => {
        if (Buffer.isBuffer(data)) {
          data = data.toString('utf8')
        }

        if (response.statusCode === 200) {
          resolve(JSON.parse(data))
        } else {
          reject(data)
        }
      })
  })
}

module.exports = { getUserDetails }
