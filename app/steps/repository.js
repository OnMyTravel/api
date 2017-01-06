const Step = require('./model')

function create (model) {
  return new Step(model).save()
}

module.exports = { create }
