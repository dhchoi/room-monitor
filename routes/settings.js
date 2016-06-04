var debug = require("debug")("app:routes:settings");
var serialport = require("../serial");
var express = require("express");
var router = express.Router();

router.get("/get-interval", function(req, res, next) {
  debug("Responding interval with value: " + global.arduinoInterval);

  res.json({interval: global.arduinoInterval});
});

router.post("/set-interval", function(req, res, next) {
  var interval = req.body.interval;
  debug("User request for set-interval with value: " + interval);

  serialport.write("set-interval,\n", function (error) {
    if (error) {
      res.json({error: "Failed to set new interval."});
    }
    else {
      setTimeout(function () {
        res.json({interval: global.arduinoInterval});
      }, 300);
    }
  });
});

module.exports = router;
