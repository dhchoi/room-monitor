/*
 * IOT device for monitoring room temperature and humidty.
 * Reads sensor data and displays them on an OLED display.
 * Sends data to web server for further analysis and management.
 * 
 * This was intended to work on Arduino Yun devices.
 */
#include <SoftwareSerial.h>
#include <Wire.h>
#include <SPI.h>
#include <SFE_MicroOLED.h>
#include "cactus_io_HIH6130.h"


/*
 * MicroOLED Definition 
 * Reference: https://learn.sparkfun.com/tutorials/micro-oled-breakout-hookup-guide
 */
#define PIN_RESET 9  // Connect RST to pin 9 (req. for SPI and I2C)
#define PIN_DC    8  // Connect DC to pin 8 (required for SPI)
#define PIN_CS    10 // Connect CS to pin 10 (required for SPI)
#define DC_JUMPER 0
// Also connect pin 13 to SCK and pin 11 to MOSI


/*
 * MicroOLED Object Declaration
 * 
 * Declare a MicroOLED object. The parameters include:
 *   1 - Reset pin: Any digital pin
 *   2 - D/C pin: Any digital pin (SPI mode only)
 *   3 - CS pin: Any digital pin (SPI mode only, 10 recommended)
 */
MicroOLED oled(PIN_RESET, PIN_DC, PIN_CS);
//MicroOLED oled(PIN_RESET, DC_JUMPER); // Example I2C declaration


/*
 * Honeywell Humidity Temperature Sensor Definition
 * Reference: http://cactus.io/hookups/sensors/temperature-humidity/hih6130/hookup-arduino-to-hih6130-temp-humidity-sensor
 */
byte address = 0x27;
HIH6130 hih6130(address);
float humidity = 0.0;
float temperature = 0.0;


/*
 * RoomMonitor Definitions
 */
// settings
bool showDisplay = true;
unsigned long displayInterval = 500L; // 0.5 seconds
unsigned long lastDisplayInterval = 0;
unsigned long monitorInterval = 60 * 1000L; // 1 minute
unsigned long lastMonitorInterval = 0;
// communication
SoftwareSerial softwareSerial(11, 12); // RX, TX
const String HEADER_DATA = "data";
const String HEADER_SETTINGS = "settings";
const String HEADER_ERROR = "error";


/*
 * Setup
 */
void setup() {
  // setup communication
  Serial1.begin(9600); // serial for Linino (if doesn't work, try 115200)
  softwareSerial.begin(115200); // serial for SoftwareSerial
  Serial.begin(9600);

  // setup oled
  oled.begin(); // Init all of the pins and configure the OLED
  oled.clear(PAGE); // Clear the display's internal memory
  oled.clear(ALL); // Clear the display's memory (gets rid of artifacts)
  oled.display(); // Display what's in the buffer (splashscreen)
  oled.setFontType(0); // Set the text to small (10 columns, 6 rows worth of characters).

  // setup temp/hum sensor
  hih6130.begin();

  delay(5000);
  Serial.println("Starting Room Monitor...");
}


/*
 * Loop
 */
void loop() {
  
  // if there is data from Linino, process message and respond to it
  if (Serial1.available()) {
    String message = Serial1.readStringUntil('\n');
    Serial.println("[Linino] " + message);

    // get device settings
    if (message.startsWith("get-settings")) {
      sendDeviceSettings();
    }
    // set device settings
    else if(message.startsWith("set-settings")) { // format: "set-settings,XXX,bool"
      int delimIndex1 = message.indexOf(',');
      int delimIndex2 = message.indexOf(',', delimIndex1 + 1);
      String intervalString = message.substring(delimIndex1 + 1, delimIndex2);
      String displayString = message.substring(delimIndex2 + 1);
  
      monitorInterval = intervalString.toInt() * 1000L; // to milliseconds
      showDisplay = displayString.equals("true") ? true : false;
      
      sendDeviceSettings();
    }
    // return error for unrecognized command
    else {
      Serial1.println(HEADER_ERROR + ",unrecognized_command");
    }
  }
  
  // do job for every corresponding interval
  unsigned long currentMillis = millis();

  // read sensor
  if (currentMillis - lastMonitorInterval >= monitorInterval) {
    hih6130.readSensor();
    humidity = hih6130.humidity;
    temperature = hih6130.temperature_C;

    // send to Linino
    String value = HEADER_DATA + "," + String(temperature) + "," + String(humidity);
    Serial1.println(value);
    Serial.println(value);
    
    // update counter
    lastMonitorInterval = currentMillis;
  }

  // manage display
  if (currentMillis - lastDisplayInterval >= displayInterval) {
    if (showDisplay) {
      // display oled text
      // x * y = 64 * 48 => setCursor(x,y)
      // - - - - - - - - - - -
      // - - T : x x . x x - -
      // - - - - - - - - - - -
      // - - H : x x . x x - -
      // - - - - - - - - - - -
      // - - - - - - - - - - - => fontType(0)
      oled.clear(PAGE);
      oled.setCursor(12, 9);
      oled.print("T:" + String(temperature));
      oled.setCursor(12, 27);
      oled.print("H:" + String(humidity));
      oled.display();
    }
    else {
      oled.clear(PAGE);
      oled.clear(ALL);
      oled.print("");
      oled.display();
    }

    // update counter
    lastDisplayInterval = currentMillis;
  }
}

void sendDeviceSettings() {
  String intervalString = String(monitorInterval / 1000); // to seconds
  String displayString = showDisplay ? "true" : "false";
  Serial1.println(HEADER_SETTINGS + "," + intervalString + "," + displayString);
}

