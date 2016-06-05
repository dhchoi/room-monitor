var debug = require("debug")("app:routes:settings");
var serialport = require("../serial");
var express = require("express");
var router = express.Router();

router.get("/get-interval", function (req, res, next) {
  debug("Responding interval with value: " + global.arduinoInterval);

  res.json({interval: global.arduinoInterval});
});

router.post("/set-interval", function (req, res, next) {
  var interval = req.body.interval;
  debug("User request for set-interval with value: " + interval);

  serialport.write("set-interval," + interval, function (error) {
    if (error) {
      return next(new Error("Failed to set new interval on device."));
    }

    setTimeout(function () { // to ensure that value gets updated
      res.json({interval: global.arduinoInterval});
    }, 300);
  });
});

// error handling middleware
router.use(function (err, req, res, next) {
  debug(err);
  res.status(err.status || 500)
    .json({
      error: err.name,
      message: err.message
    });
});

module.exports = router;
