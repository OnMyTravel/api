/* global describe, it */
const EventEmitter = require('events').EventEmitter;
const proxyquire = require('proxyquire').noPreserveCache();
const sinon = require('sinon');

const chai = require('chai');

chai.use(require('sinon-chai'));
const expect = chai.expect;

const connectionObject = new EventEmitter();

const mocks = {
    'mongoose': {
        'connect': sinon.spy(),
        'connection': connectionObject
    },
    './app': {
        'listen': sinon.stub()
    }
};

// We load the module and mock some dependencies
proxyquire('../index', mocks);

describe('Application starter', function() {

    beforeEach(() => {
        sinon.stub(console, 'error');
    });

    afterEach(() => {
        console.error.restore();
    });

    it('should log the connection while', function() {
        // when
        let error = new Error();
        connectionObject.emit('error', error);

        // then
        expect(console.error).to.have.been.calledWith(error);
        return expect(mocks['./app'].listen).not.to.have.been.called;
    });

    it('should set the application listening on the configuration port', function() {
        // when
        connectionObject.emit('open');

        // then
        expect(mocks['./app'].listen).to.have.been.calledWith(3000);
    });
});
