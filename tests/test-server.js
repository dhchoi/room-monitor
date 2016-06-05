var Debug = require("debug");
// Debug.enable("app:*");
var debug = Debug("app:tests:server");

var chai = require("chai");
chai.use(require("chai-http"));
var server = chai.request(require("../app")); // app should be exported as express() within file
var expect = chai.expect;

// cherry pick by using `describe.only()` or `describe.skip()`

/*
 * Route: /
 */
describe("Requesting GET /", function () {
  it("should return status 200", function (done) {
    server.get("/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done(err);
      });
  });
});


/*
 * Route: /settings
 */
var routeSettingsInterval = "/settings/interval";
var setIntervalParams;

describe("Requesting GET " + routeSettingsInterval, function () {
  it("should return status 200", function (done) {
    server.get(routeSettingsInterval)
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done(err);
      });
  });
  it("should be json", function (done) {
    server.get(routeSettingsInterval)
      .end(function (err, res) {
        expect(res).to.be.json;
        done(err);
      });
  });
  it("should contain correct fields", function (done) {
    server.get(routeSettingsInterval)
      .end(function (err, res) {
        expect(res.body).to.have.property("interval");
        done(err);
      });
  });
});

describe("Requesting POST " + routeSettingsInterval, function () {
  beforeEach(function () {
    setIntervalParams = {interval: 60};
  });

  it("should return status 200", function (done) {
    server.post(routeSettingsInterval)
      .send(setIntervalParams)
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done(err);
      });
  });
  it("should be json", function (done) {
    server.post(routeSettingsInterval)
      .send(setIntervalParams)
      .end(function (err, res) {
        expect(res).to.be.json;
        done(err);
      });
  });
  it("should contain correct fields", function (done) {
    server.post(routeSettingsInterval)
      .send(setIntervalParams)
      .end(function (err, res) {
        expect(res.body).to.have.property("interval");
        done(err);
      });
  });
});
