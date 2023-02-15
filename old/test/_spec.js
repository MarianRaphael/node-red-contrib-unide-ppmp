var should = require("should");
var helper = require("node-red-test-helper");
var lowerNode = require("../lower-case.js");

describe('lower-case Node', function () {

  afterEach(function () {
    helper.unload();
  });

  it('should be loaded', function (done) {
    var flow = [{ id: "n1", type: "machine-in", name: "ppmp machine in", topic: "test/machine" }];
    helper.load(machine-in, flow, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'ppmp machine in');
      n1.should.have.property('topic', 'test/machine');
      done();
    });
  });

  it('should be loaded', function (done) {
    var flow = [{ id: "n1", type: "measurement-in", name: "ppmp measurement in", topic: "test/measurement" }];
    helper.load(measurement-in, flow, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'ppmp measurement in');
      n1.should.have.property('topic', 'test/measurement');
      done();
    });
  });

  it('should be loaded', function (done) {
    var flow = [{ id: "n1", type: "process-in", name: "ppmp process in", topic: "test/process" }];
    helper.load(process-in, flow, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'ppmp process in');
      n1.should.have.property('topic', 'test/process');
      done();
    });
  });

  it('should be loaded', function (done) {
    var flow = [{ id: "n1", type: "ppmp-in", name: "ppmp in", topic: "test/all" }];
    helper.load(ppmp-in, flow, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'ppmp in');
      n1.should.have.property('topic', 'test/all');
      done();
    });
  });

});
