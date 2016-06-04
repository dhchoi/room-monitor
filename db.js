var debug = require('debug')('app:database');
var sqlite3 = require('sqlite3').verbose();
var db = null;

/**
 * Returns a string formatted date for SQL queries.
 * Format used is 'YYYY-MM-DD HH:MM:SS'.
 *
 * @param date which is string formatted
 */
function formatDate(date) {
  var year = date.getFullYear();
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);
  var hour = ("0" + date.getHours()).slice(-2);
  var minutes = ("0" + date.getMinutes()).slice(-2);
  var seconds = ("0" + date.getSeconds()).slice(-2);

  return year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds;
}

module.exports = {

  /**
   * Initializes the database by creating the table if it didn't exist.
   */
  initialize: function () {
    debug("Initializing database...");

    db = new sqlite3.Database('./data/data.db');
    db.run("CREATE TABLE IF NOT EXISTS env (date DATETIME DEFAULT CURRENT_TIMESTAMP PRIMARY KEY, temperature REAL, humidity REAL)");
  },

  /**
   * Inserts values into database table.
   *
   * @param temperature value to insert
   * @param humidity value to insert
   */
  insert: function (temperature, humidity) {
    var values = [temperature, humidity];
    debug("Inserting values for (temperature, humidity): ", values);

    db.run("INSERT INTO env (temperature, humidity) VALUES (?, ?)", values);
  },

  /**
   * Returns all rows within database table that are within date range.
   * __NOTE__: ALWAYS CHECK DEVICE'S TIMEZONE!
   *
   * @param start start date
   * @param end end date
   * @param cb callback function with params (err, rows)
   */
  getWithinDates: function (start, end, cb) {
    var startDate = formatDate(start);
    var endDate = formatDate(end);
    debug("Searching for data within range: " + startDate + " ~ " + endDate);

    var query = "SELECT datetime(date, 'localtime'), temperature, humidity FROM env WHERE strftime('%s', date, 'localtime') BETWEEN strftime('%s', '" + startDate + "') AND strftime('%s', '" + endDate + "')";
    db.all(query, cb);
  },

  /**
   * Returns all rows within database table.
   *
   * @param cb callback function with params (err, rows)
   */
  getAll: function (cb) {
    debug("Retrieving all data within database...");

    db.all("SELECT * FROM env", cb);
  },

  /**
   * Closes the database.
   */
  close: function () {
    debug("Closing the database...");

    db.close();
  }
};
