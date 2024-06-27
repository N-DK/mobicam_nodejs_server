const mqtt = require('mqtt');
const apiController = require('../app/controllers/APIController');
const { warningHighWay } = require('../modules/warningHighWay');
const highway = require('../app/models/Highway');
const turf = require('@turf/turf');

require('dotenv').config();

class MQTTService {
    constructor(host, messageCallback, io) {
        this.mqttClient = null;
        this.host = host;
        this.messageCallback = messageCallback;
        this.io = io;
        this.cars = [];
    }

    async initialize() {
        try {
            const results = await new Promise((resolve, reject) => {
                highway.getHighway((err, results) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        resolve(results);
                    }
                });
            });
            this.highways = results; // Lưu trữ kết quả vào đối tượng
            // Tạo vùng đệm cho các đoạn đường cao tốc
            // const bufferedHighways = results.map((highway) => ({
            //     ...highway,
            //     regions: highway.regions.map((region) => {
            //         const line = turf.lineString(region.geometry);
            //         const bufferedLine = turf.buffer(line, 8, {
            //             units: 'meters',
            //         });
            //         return {
            //             ...region,
            //             bufferedGeometry: bufferedLine,
            //         };
            //     }),
            // }));
            // Lưu trữ kết quả vào đối tượng
            // this.highways = bufferedHighways;
        } catch (error) {
            console.error(error);
        }
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
        this.mqttClient.on('message', (topic, message) => {
            // Sử dụng arrow function
            // console.log('MQTT', this.highways);
            apiController.handleMQTTMessage(topic, message);
            warningHighWay(this.cars, this.io, this.highways, message);
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
