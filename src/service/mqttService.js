const mqtt = require('mqtt');
const apiController = require('../app/controllers/APIController');

require('dotenv').config();

class MQTTService {
    constructor(host, messageCallback) {
        this.mqttClient = null;
        this.host = host;
        this.messageCallback = messageCallback;
    }

    connect() {
        this.mqttClient = mqtt.connect(this.host, {
            username: process.env.MQTT_USERNAME,
            password: process.env.MQTT_PASS,
        });

        // MQTT Callback for 'error' event
        this.mqttClient.on('error', (err) => {
            console.log(err);
            this.mqttClient.end();
        });

        // MQTT Callback for 'connect' event
        this.mqttClient.on('connect', () => {
            console.log(`MQTT client connected`);
        });

        // Call the message callback function when message arrived
        this.mqttClient.on('message', function (topic, message) {
            apiController.handleMQTTMessage(topic, message);

            if (this.messageCallback) this.messageCallback(topic, message);
        });

        this.mqttClient.on('close', () => {
            console.log(`MQTT client disconnected`);
        });
    }

    // Subscribe to MQTT Message
    subscribe(topic, options) {
        this.mqttClient.subscribe(topic, options);
    }
}

module.exports = MQTTService;
