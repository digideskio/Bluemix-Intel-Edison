//Copyright (c) 2015 Stefania Kaczmarczyk
//
//Permission is hereby granted, free of charge, to any person obtaining a copy
//of this software and associated documentation files (the "Software"), to deal
//in the Software without restriction, including without limitation the rights
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//copies of the Software, and to permit persons to whom the Software is
//furnished to do so, subject to the following conditions:

//The above copyright notice and this permission notice shall be included in all
//copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//SOFTWARE.
//
 
// Load Grove and MQTT modules
var groveSensor = require('jsupm_grove');
var mqtt = require('mqtt');
var fs = require('fs');
var LCD = require('jsupm_i2clcd');

// Initiate new temperature sensor on analog pin 0
var temp = new groveSensor.GroveTemp(0);

// Set up variables for connection to IoTF
var cfgFile = "/node_app_slot/device.cfg";
var port = 1883;
var broker;
var topic;
var client;

// Set up variables for LCD display
var text = " ";
var myLCD = new LCD.Jhd1313m1(6, 0x3E, 0x62);

// Set up MQTT connection
require('properties').parse(cfgFile, {path: true}, function(err, cfg) {
    if (!cfg.org) {
        throw "No organization defined in config file.";
        }
    else {
        organization = cfg.org;
    }
    if (!cfg.type) {
        throw "No device type defined in config file.";
        }
    else {
        deviceType = cfg.type;
    }
    if (!cfg.id) {
            throw "No device id defined in config file.";
        }
    else {
        deviceId = cfg.id;
    }
    if (!cfg.authtoken) {
            throw "No auth token defined in config file.";
        }
    else {
        password = cfg.auth-token;
    }
    
    
    broker = organization + ".messaging.internetofthings.ibmcloud.com";
    clientId = "d:" + organization + ":" + deviceType + ":" + deviceId;
    
    // Connect to MQTT
    client = mqtt.connect("mqtt://" + broker + ":" + port, {
        "clientId": clientId,
        "keepalive": 10000,
        "username": "use-token-auth",
        "password": password
        }); // End mqtt.connect

    topic = 'iot-2/evt/status/fmt/json';

    // Send a message every second
    var interval = setInterval(publishMessage, 1000);

    // Subscribe and Publish
    client.subscribe('iot-2/cmd/+/fmt/json', {
        qos: 1
    }, function(err, granted) {
        if (err) throw err;
        console.log("subscribed");
    }); // End client.subscribe

    client.on('error', function(err) {
        console.error('client error ' + err);
        process.exit(1);
    }); // End client.on error
    
    // When a message is received from the IoT Foundation, send to the LCD display
    client.on('message', function(topic, message, packet) {
        console.log('Message received on topic: ' + topic);
        var msg = JSON.parse(message.toString());
        console.log(msg);

        lcdDisplay(msg);

    }); // End client.on message
    
}); // End require cfgFile

function publishMessage() {
    var message = {};
    message.d = {};

    // Read the temperature and send the data to IoTF
    var c = temp.value();
    var f = c * 9.0 / 5.0 + 32.0;

    message.d.celsius = c;
    message.d.fahrenheit = f;

    console.log(message);

    // Publish message to MQTT status topic
    client.publish(topic, JSON.stringify(message));
} // End publishMessage

function lcdDisplay(data) {
    var text = data.d.text;
    var color = data.d.color;

    myLCD.clear();
    
    // If temp is good
    if (color === "green") {
        myLCD.setColor(110, 215, 089);
    }
    
    // IF temp is critical
    if (color === "red") {
        myLCD.setColor(210, 058, 053);
    }

    myLCD.setCursor(0, 1);
    myLCD.write('Temperature:');
    myLCD.setCursor(1, 1);
    myLCD.write(text);
} // End lcdDisplay
