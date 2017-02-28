let Client = require('node-rest-client').Client
let Promise = require('bluebird')

const facebook_api_base_url = 'https://graph.facebook.com'
const facebook_api_version = 'v2.8'

function getUserDetails (token) {
  return new Promise((resolve, reject) => {
    var client = new Client({
      // proxy: {
      //   host: '192.168.50.13',
      //   port: 8080,
      //   tunnel: true
      // }
    })

    var args = {
      headers: { 'Authorization': 'Bearer ' + token },
      requestConfig: { timeout: 2000 },
      responseConfig: { timeout: 2000 }
    }

    var req = client.get(facebook_api_base_url + '/' + facebook_api_version + '/me?fields=id%2Cname%2Cemail', args,
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
