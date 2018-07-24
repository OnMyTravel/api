module.exports = (error, req, res, next) => {
  console.error(error)
  next(error)
}
