# Node-RED with Intel Edison, Grove Sensors, and  MQTT in Bluemix
Example of sending and receiving data with the Intel Edison using MQTT and Node-RED.

This app uses the Node-RED Starter and the IoT Foundation in Bluemix.  

## Connection with MQTT to IoT Foundation
This app uses mqtt.connect rather than mqtt.createClient.

```javascript
broker = organization + ".messaging.internetofthings.ibmcloud.com";
clientId = "d:" + organization + ":" + deviceType + ":" + deviceId;
    
// Connect to MQTT
client = mqtt.connect("mqtt://" + broker + ":" + port, {
    "clientId": clientId,
    "keepalive": 10000,
    "username": "use-token-auth",
    "password": password
    });
```

## Receiving Data from an IoT Out Node in Node-RED with MQTT
QOS 1 is the most important feature to get a consistent stream of messages from the Foundation.


```javascript
// Subscribe and Publish
client.subscribe('iot-2/cmd/+/fmt/json', {
    qos: 1
}, function(err, granted) {
    if (err) throw err;
    console.log("subscribed");
});

client.on('error', function(err) {
    console.error('client error ' + err);
    process.exit(1);
});
    
// When a message is received from the IoT Foundation, send to the LCD display
client.on('message', function(topic, message, packet) {
    console.log('Message received on topic: ' + topic);
    var msg = JSON.parse(message.toString());
    console.log(msg);

    lcdDisplay(msg);

});
```

## Example IoT Out Node Configuration
![Node-RED Bluemix IoT Out Node](http://www.stefdoestech.com/wp-content/uploads/2015/09/IBMIoTAppOut.png)

