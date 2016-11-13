/* global it, describe */
const proxyquire = require('proxyquire').noPreserveCache()

const stubDevelopmentConfig = { db: 'url:developmentDb' }
const stubTestConfig = { db: 'url:testDb' }
const stubProductionConfig = { db: 'url:productionDb' }

const chai = require('chai')
const expect = chai.expect

describe('Configuration', function () {
  it('should return development configuration by default', function () {
    // When
    process.env.NODE_ENV = 'development'
    const config = proxyquire('../../config', {
      './env/development': stubDevelopmentConfig,
      './env/test': stubTestConfig,
      './env/production': stubProductionConfig
    })

    // Then
    expect(config).to.equal(stubDevelopmentConfig)
  })

  it('should return production configuration according to environment variable', function () {
    // When
    process.env.NODE_ENV = 'production'
    const config = proxyquire('../../config', {
      './env/development': stubDevelopmentConfig,
      './env/test': stubTestConfig,
      './env/production': stubProductionConfig
    })

    // Then
    expect(config).to.equal(stubProductionConfig)
  })

  it('should work if the environment is not defined', function () {
    // When
    process.env.NODE_ENV = ''
    const config = proxyquire('../../config', {
      './env/development': stubDevelopmentConfig,
      './env/test': stubTestConfig,
      './env/production': stubProductionConfig
    })

    // Then
    expect(config).to.equal(stubDevelopmentConfig)
  })
})
