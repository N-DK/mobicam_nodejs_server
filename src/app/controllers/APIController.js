const { ObjectId } = require('mongodb');
const region = require('../models/Region');
const { isPointInCircle, isPointInBounds } = require('../../utils');

class APIController {
    constructor() {
        this.io;
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

        region.addRegion(
            { ...data, create_time: Date.now(), update_time: Date.now() },
            (err, result) => {
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
            },
        );
    }
    // [PATCH] /region/delete?id=
    delete(req, res, next) {
        let _id = req?.query?.id;
        if (!_id) {
            return res.status(400).json({ error: 'Error 400!' });
        }

        _id = new ObjectId(_id);

        region.deleteRegion(_id, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    error: 'Error 500!',
                });
            } else {
                res.status(200).json({
                    message: 'Region delete successfully',
                    result: result,
                });
            }
        });
    }
    // [PATCH] /region/edit
    edit(req, res, next) {
        const data = req?.body;
        if (!data) {
            return res.status(400).json({ error: 'Error 400!' });
        }

        let { _id, ...updateData } = data;

        _id = new ObjectId(_id);

        region.updateRegion(_id, { ...updateData }, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error 500!' });
            } else {
                return res.status(200).json({
                    message: 'Region update successfully',
                    result: result,
                });
            }
        });
    }

    setIo(io) {
        this.io = io;
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
                                ? isPointInCircle(r.center, r.radius, point)
                                : isPointInBounds(point, r.bounds);
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
                                car.region_id.equals(r._id) &&
                                Number(r.isInWarning) === 1
                            ) {
                                record.in_time = new Date().getTime();
                                record.region_name = r.name;
                                // this.io.emit('warning', this.userId);
                                console.log(`Xe ${car.vid} đi vào ${r.name}`);
                                region.addRecord({ ...record }, () => {});
                            } else if (
                                car.state &&
                                !inBounds &&
                                car.region_id.equals(r._id) &&
                                Number(r.isOutWarning) === 1
                            ) {
                                record.out_time = new Date().getTime();
                                record.region_name = r.name;
                                region.addRecord({ ...record }, () => {});
                                // this.io.emit('warning', this.userId);
                                console.log(`Xe ${car.vid} đi ra ${r.name}`);
                            }
                            car.state = inBounds;
                        }
                    }
                }
            }
        } catch (error) {}
    }
    // check nhiều đường cao tốc
    // đường cao tốc sẽ chứa các nodes và node sẽ là những region
    // Khi nào xe đi vào region sẽ báo đi vào đường cao tốc
}

module.exports = new APIController();
