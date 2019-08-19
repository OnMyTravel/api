const MultipleErrors = require('../../domain/MultipleErrors')

const JSONAPIError = require('jsonapi-serializer').Error

const serializer = (error) => {
  if (error instanceof MultipleErrors) {
    const errorPayload = error.getErrors().map(error => {
      return {
        code: '400',
        title: error.message,
      }
    });

    return new JSONAPIError(errorPayload);
  }

  const jsonAPIerror = new JSONAPIError([{
    code: '400',
    title: error.message,
  }])

  return jsonAPIerror;
}

module.exports = serializer;