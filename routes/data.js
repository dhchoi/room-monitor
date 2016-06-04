var debug = require("debug")("app:routes:data");
var db = require("../db");
var express = require("express");
var router = express.Router();

router.get("/within-dates", function(req, res, next) {
  var startDateParam =  req.query.startDate;
  var endDateParam = req.query.endDate;
  debug("Received user request for startDate: " + startDateParam + ", endDate: " + endDateParam);

  if (!startDateParam || !endDateParam) {
    res.json({error: "Empty start date or end date given."})
  }
  else {
    var startDate =  new Date(startDateParam);
    var endDate = new Date(endDateParam);

    db.getWithinDates(startDate, endDate, function (err, rows) {
      if (err) {
        debug("Error:", err);
        res.json({error: err});
      }
      else {
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
      }
    });
  }
});

module.exports = router;
