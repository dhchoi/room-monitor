var expect = require("chai").expect;

var args = null;
// describe.only(), describe.skip()
describe("Test", function() {
  beforeEach(function(){
    args = 1;
  });

  it("should do something", function () {
    expect(args).to.deep.equal(1);
  });
  it("should do another thing", function () {
    expect(1+3).to.equal(4);
  });
});

describe("Test2", function() {
  it("should do something", function () {
    var args = 1;
    expect(args).to.deep.equal(1);
  });
  it("should do another thing", function () {
    expect(1+3).to.equal(5);
  });
});
