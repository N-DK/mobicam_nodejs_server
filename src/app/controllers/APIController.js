const { Timestamp } = require('mongodb');
const region = require('../models/Region');
const { haversineDistance } = require('../../utils');

class APIController {
    constructor() {
        this.regions = [];
        this.get = this.get.bind(this);
        this.userId = null;
        this.cars = [];
    }

    // [GET] /region/get
    get(req, res, next) {
        const userId = req?.body?.userId;
        this.userId = userId;
        region.getRegion(userId, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    error: 'An error occurred while fetching regions',
                });
            } else {
                this.regions = results;
                res.json({ result: 1, data: results });
            }
        });
    }
    // [GET] /region/get/record?limit=10
    record(req, res, next) {
        const limit = parseInt(req.query.limit) || 10;
        const userId = req?.body?.userId;
        region.getRecord({ limit, userId }, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    error: 'An error occurred while fetching records',
                });
            } else {
                res.json({ result: 1, data: results });
            }
        });
    }
    // [POST] /region/add
    add(req, res, next) {
        const data = req?.body;

        if (!data) {
            return res.status(400).json({ error: 'payload is required' });
        }

        region.addRegion({ ...data }, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    error: 'An error occurred while adding the region',
                });
            } else {
                res.status(201).json({
                    message: 'Region added successfully',
                    result: result,
                });
            }
        });
    }

    isPointInCircle(center, r, point) {
        const [x, y] = center;
        const x1 = Number(point[0]),
            y1 = Number(point[1]);
        const distance = haversineDistance(x, y, x1, y1) * 1000;
        return distance <= r;
    }

    isPointInBounds(point, bounds) {
        const x = Number(point[0]),
            y = Number(point[1]);
        let inside = false;
        for (let i = 0, j = bounds.length - 1; i < bounds.length; j = i++) {
            const xi = bounds[i][0],
                yi = bounds[i][1];
            const xj = bounds[j][0],
                yj = bounds[j][1];

            const intersect =
                yi > y !== yj > y &&
                x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
            if (intersect) inside = !inside;
        }
        return inside;
    }

    handleMQTTMessage(topic, message) {
        try {
            if (this.regions.length > 0) {
                const data = JSON.parse(message.toString());
                for (const r of this.regions) {
                    const regionIndex = r.vehicles
                        ? r.vehicles.findIndex(
                              (vehicle) => vehicle === data[0]?.vid,
                          )
                        : -1;
                    if (regionIndex !== -1) {
                        const point = data[0].gps.split(',');
                        const carIndex = this.cars.findIndex(
                            (car) =>
                                car.vid === data[0]?.vid &&
                                car.region_id.equals(r._id),
                        );
                        const inBounds =
                            r.type === 'circle'
                                ? this.isPointInCircle(
                                      r.center,
                                      r.radius,
                                      point,
                                  )
                                : this.isPointInBounds(point, r.bounds);
                        if (this.cars.length === 0 || carIndex === -1) {
                            this.cars.push({
                                region_id: r._id,
                                region_name: r.name,
                                vid: data[0]?.vid,
                                dev_id: data[0]?.id,
                                state: inBounds,
                            });
                        } else {
                            const car = this.cars[carIndex];
                            const { state, ...carWithoutState } = car;
                            const record = {
                                ...carWithoutState,
                                create_time: new Date().getTime(),
                                update_time: new Date().getTime(),
                                in_time: null,
                                out_time: null,
                                userId: this.userId,
                                isDelete: false,
                            };
                            if (
                                !car.state &&
                                inBounds &&
                                car.region_id.equals(r._id)
                            ) {
                                record.in_time = new Date().getTime();
                                console.log(`Xe ${car.vid} đi vào ${r.name}`);
                                region.addRecord({ ...record }, () => {});
                            } else if (
                                car.state &&
                                !inBounds &&
                                car.region_id.equals(r._id)
                            ) {
                                record.out_time = new Date().getTime();
                                region.addRecord({ ...record }, () => {});
                                console.log(`Xe ${car.vid} đi ra ${r.name}`);
                            }
                            car.state = inBounds;
                        }
                    }
                    console.log(this.cars);
                }
            }
        } catch (error) {}
    }
}

module.exports = new APIController();
