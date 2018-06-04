// const chai = require("chai");
// const sinon = require("sinon");
// const sinonChai = require("sinon-chai");
// const chaiHttp = require('chai-http');
// chai.should();
// chai.use(chaiHttp);
// chai.use(sinonChai);

// const config = require('config')

// let getStub = sinon.stub()

// const express = require('express')

// const router = require('../../app/steps/routes')
// const controller = require('../../app/steps/controller')
// const middleware = require('../../app/steps/middleware')

// describe('Integration | Steps', () => {
//   describe('Routes', () => {
//     describe('/:stepid/image/:imageid', () => {

//       let sandbox;
//       beforeEach(() => {
//         sandbox = sinon.createSandbox()
//         sandbox.stub(express, 'Router').returns({
//           get: getStub,
//           post: sinon.stub(),
//           delete: sinon.stub(),
//           put: sinon.stub()
//         });

//         sandbox.stub(controller, 'getImage')
//         sandbox.stub(middleware, 'fileExists')
//       })

//       afterEach(() => {
//         sandbox.restore()
//       })

//       it('should', (done) => {
//         chai.request(router)
//           .get('/52456/images/2567')
//           .end(() => {
//             done()
//           })
//       })

//       it('should exists', () => {
//         getStub.should.have.been.calledWith('/:stepid/images/:imageid', middleware.fileExists, controller.getImage)
//       })
//     })
//   })
// })
