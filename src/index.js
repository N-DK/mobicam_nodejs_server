const express = require('express');
const app = express();
const port = 3000;
const MQTTService = require('./service/mqttService');

const route = require('./routes');

var cors = require('cors');
require('dotenv').config();

var bodyParser = require('body-parser');

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

const mqttService = new MQTTService(process.env.MQTT_HOST);

mqttService.connect();

mqttService.subscribe('live/status');

route(app);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
