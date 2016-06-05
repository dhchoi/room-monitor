var debug = require("debug")("app:routes:data");
var db = require("../db");
var express = require("express");
var router = express.Router();

function isValidDate(date) {
  return (Object.prototype.toString.call(date) === "[object Date]") && !isNaN(date.getTime());
}

router.get("/within-dates", function (req, res, next) {
  var startDateParam = req.query.startDate;
  var endDateParam = req.query.endDate;
  var startDate = new Date(startDateParam);
  var endDate = new Date(endDateParam);
  debug("Received user request for startDate: " + startDateParam + ", endDate: " + endDateParam);

  if (!startDateParam || !endDateParam) {
    return next(new Error("Empty start date or end date given."));
  }

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return next(new Error("Requested dates are in invalid format."));
  }

  db.getWithinDates(startDate, endDate, function (err, rows) {
    if (err) {
      debug(err);
      return next(new Error("Failed to retrieve data from server."));
    }

    debug("Found " + rows.length + " entries for user's request.");

    // reformat data
    var labels = [];
    var temperature = [];
    var humidity = [];
    for (var i = 0; i < rows.length; i++) {
      labels.push(rows[i]["datetime(date, 'localtime')"]);
      temperature.push(rows[i].temperature);
      humidity.push(rows[i].humidity);
    }

    res.json({
      labels: labels,
      temperature: temperature,
      humidity: humidity
    });

  });

});

// error handling middleware
router.use(function (err, req, res, next) {
  debug(err);
  next(err);
});

module.exports = router;
