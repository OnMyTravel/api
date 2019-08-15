const sinon = require('sinon')

const mockResponseObject = () => {
    const res = {};
    res.status = sinon.stub().returns(res);
    res.cookie = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    return res;
};

module.exports = {
    mockResponseObject
}