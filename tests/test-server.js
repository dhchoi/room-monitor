var Debug = require("debug");
// Debug.enable("app:*"); // uncomment to have all logs printed to console
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
 * Route: /data
 */
var db = require("../db");
var routeDataWithinDates = "/data/within-dates";

describe("Requesting GET " + routeDataWithinDates, function () {
  before(function () {
    db.initialize();
  });
  after(function () {
    db.close();
  });
  it("should return error 500 if no dates are given", function (done) {
    server.get(routeDataWithinDates)
      .end(function (err, res) {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("error");
        expect(res.body).to.have.property("message");
        done();
      });
  });
  it("should return error 500 if invalid dates are given", function (done) {
    server.get(routeDataWithinDates)
      .query({
        startDate: "asdf",
        endDate: "asfds"
      })
      .end(function (err, res) {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("error");
        expect(res.body).to.have.property("message");
        done();
      });
  });
  it("should return 200 with the proper response fields", function (done) {
    server.get(routeDataWithinDates)
      .query({
        startDate: "2016-06-01 10:00",
        endDate: "2016-06-06 14:00"
      })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("labels");
        expect(res.body).to.have.property("temperature");
        expect(res.body).to.have.property("humidity");
        done(err);
      });
  });
});


/*
 * Route: /settings
 */
var routeSettingsDevice = "/settings/device";
var setIntervalParams;

describe("Requesting GET " + routeSettingsDevice, function () {
  it("should return status 200", function (done) {
    server.get(routeSettingsDevice)
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done(err);
      });
  });
  it("should be json", function (done) {
    server.get(routeSettingsDevice)
      .end(function (err, res) {
        expect(res).to.be.json;
        done(err);
      });
  });
  it("should contain correct fields", function (done) {
    server.get(routeSettingsDevice)
      .end(function (err, res) {
        expect(res.body).to.have.property("interval");
        done(err);
      });
  });
});

describe("Requesting POST " + routeSettingsDevice, function () {
  beforeEach(function () {
    setIntervalParams = {interval: 60};
  });

  it("should return status 200", function (done) {
    server.post(routeSettingsDevice)
      .send(setIntervalParams)
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done(err);
      });
  });
  it("should be json", function (done) {
    server.post(routeSettingsDevice)
      .send(setIntervalParams)
      .end(function (err, res) {
        expect(res).to.be.json;
        done(err);
      });
  });
  it("should contain correct fields", function (done) {
    server.post(routeSettingsDevice)
      .send(setIntervalParams)
      .end(function (err, res) {
        expect(res.body).to.have.property("interval");
        done(err);
      });
  });
});
