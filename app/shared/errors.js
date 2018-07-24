class ContainerError extends Error {}
class GPSError extends Error {}
class TripNotFound extends Error {}
class DayNotFound extends Error {}

module.exports = { ContainerError, GPSError, TripNotFound, DayNotFound }
