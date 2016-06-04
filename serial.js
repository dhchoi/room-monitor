var debug = require('debug')('app:serial');
var serialport = require("serialport");
var port = null;

module.exports = {

  /**
   * Opens a serial port and binds a callback function for receiving data.
   *
   * @param portPath path of the connection
   * @param baudRate baud rate of the connection
   * @param openCallback callback function to call as soon as port is opened
   * @param dataCallback callback function with params (data)
   */
  initialize: function (portPath, baudRate, openCallback, dataCallback) {
    debug("Initializing serialport...");

    // create port
    port = new serialport.SerialPort(portPath, {
      baudRate: baudRate,
      parser: serialport.parsers.readline("\n") // look for return and newline at end of each data packet
    });

    // bind callbacks

    port.on("open", function (error) {
      if (error) {
        debug("Failed to open port: ", error);
      }
      else {
        debug("Port opened on path " + port.path + " with baudRate " + port.options.baudRate);
        openCallback();
        port.on("data", dataCallback);
      }
    });

    port.on("close", function () {
      debug("Closing port...");
    });

    port.on("error", function (error) {
      debug("Error on port: ", error);
    });
  },

  /**
   * Writes to the open port.
   *
   * @param data to be sent
   * @param cb callback function with params (error)
   */
  write: function (data, cb) {
    if (!port) {
      debug("No open port available.");
      return;
    }

    port.write(data, function () {
      port.drain(function (error) {
        if (error) {
          debug("Error while writing to port:", error);
        }
        if (cb) {
          cb(error);
        }
      });
    });
  },

  /**
   * Prints which serial ports are available.
   */
  checkAvailablePorts: function () {
    serialport.list(function (err, ports) {
      ports.forEach(function (availablePort) {
        debug("Available portPath: " + availablePort.comName);
      });
    });
  },

  /**
   * Closes the serialport.
   */
  close: function () {
    debug("Closing serialport...");
    port.close();
  }
};
