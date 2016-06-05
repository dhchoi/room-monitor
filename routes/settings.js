var debug = require("debug")("app:routes:settings");
var serialport = require("../serial");
var express = require("express");
var router = express.Router();

router.route("/device")
  .get(function (req, res, next) {
    var settings = {
      interval: global.deviceInterval,
      display: global.deviceDisplay
    };
    debug("Responding device settings with values", settings);

    res.json(settings);
  })
  .post(function (req, res, next) {
    var settings = {
      interval: req.body.interval,
      display: req.body.display
    };
    debug("Request for new device settings with values" + settings);

    serialport.write("set-settings," + settings.interval + "," + settings.display, function (error) {
      if (error) {
        return next(new Error("Failed to set new device settings."));
      }

      setTimeout(function () { // to ensure that value gets updated
        res.json({
          interval: global.deviceInterval,
          display: global.deviceDisplay
        });
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
