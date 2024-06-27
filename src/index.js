const express = require('express');
const app = express();
const port = 3000;
const route = require('./routes');

const http = require('http');

var cors = require('cors');
require('dotenv').config();

var bodyParser = require('body-parser');
const { initializeDB } = require('./config/db');
const { initialize, getIo } = require('./service/socketService');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Cors config
app.use(cors());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-Requested-With,content-type',
    );
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Connect DB
const connectDB = async () => {
    try {
        await initializeDB();
    } catch (error) {}
};
connectDB();

// Connect MQTT
// const mqttService = new MQTTService(process.env.MQTT_HOST);
// mqttService.connect();
// mqttService.subscribe('live/status');

// Connect socket
const server = http.createServer(app);
initialize(server);

route(app);

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    // api.setIo(getIo());
});
