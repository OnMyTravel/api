var pjson = require('./package.json')
var api = require('./app')

api.listen(3000, function () {
  console.log(pjson.name + ': running on port 3000')
})
