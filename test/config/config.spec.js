/* global it, describe */
const proxyquire = require('proxyquire').noPreserveCache()

const stubDevelopmentConfig = { db: 'url:developmentDb', app: { port: 1234 } }
const stubTestConfig = { db: 'url:testDb' }
const stubProductionConfig = { db: 'url:productionDb' }

const chai = require('chai')
const expect = chai.expect

describe('Configuration', function () {
  afterEach(function () {
    process.env.NODE_ENV = 'test'
  })

  it('should return development configuration by default', function () {
    // When
    process.env.NODE_ENV = 'development'
    const config = proxyquire('../../config', {
      './env/development': stubDevelopmentConfig,
      './env/test': stubTestConfig,
      './env/production': stubProductionConfig
    })

    // Then
    expect(config).to.deep.equal(stubDevelopmentConfig)
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
    expect(config.db).to.equal(stubProductionConfig.db)
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
    expect(config).to.deep.equal(stubDevelopmentConfig)
  })

  it('should have a default configuration', function () {
    process.env.NODE_ENV = 'test'
    const config = proxyquire('../../config', {
      './env/development': stubDevelopmentConfig,
      './env/test': stubTestConfig,
      './env/production': stubProductionConfig
    })

    // Then
    expect(config).to.have.property('app')
    expect(config.app).to.have.property('port', 3000)
  })

  it('should override default configuration with params', function () {
    process.env.NODE_ENV = 'development'
    const config = proxyquire('../../config', {
      './env/development': stubDevelopmentConfig,
      './env/test': stubTestConfig,
      './env/production': stubProductionConfig
    })

    // Then
    expect(config).to.have.property('app')
    expect(config.app).to.have.property('port', 1234)
  })
})
