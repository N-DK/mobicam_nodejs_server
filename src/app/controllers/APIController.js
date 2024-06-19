const region = require('../models/Region');

class APIController {
    constructor() {
        this.regions = [];
        this.get = this.get.bind(this);
        this.cars = [];
    }

    // [GET] /region/get
    get(req, res, next) {
        const userId = req?.body?.userId;
        region.getRegion(userId, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    error: 'An error occurred while fetching regions',
                });
            } else {
                this.regions = results;
                res.json({ result: results });
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
                res.json({ result: results });
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

    isPointInBounds(point, bounds) {
        const x = point[0],
            y = point[1];
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
                this.regions.forEach((region) => {
                    const bounds = region.bounds;
                    if (
                        region.vehicles.findIndex(
                            (vehicle) => vehicle === data[0]?.vid,
                        ) !== -1
                    ) {
                        const point = data[0].gps.split(',');
                        if (
                            this.cars.length === 0 ||
                            this.cars.findIndex(
                                (car) =>
                                    car.vid === data[0]?.vid &&
                                    car.region_id === region._id,
                            ) === -1
                        ) {
                            this.cars.push({
                                region_id: region._id,
                                region_name: region.name,
                                vid: data[0]?.vid,
                                v_name: data[0]?.vid,
                                state: this.isPointInBounds(point, bounds),
                            });
                        } else {
                            let index = this.cars.findIndex(
                                (car) =>
                                    car.vid === data[0]?.vid &&
                                    car.region_id === region._id,
                            );
                            if (
                                !this.cars[index].state &&
                                this.isPointInBounds(point, bounds) &&
                                this.cars[index].region_id === region._id
                            ) {
                                console.log(
                                    `Xe ${this.cars[index].vid} đi vào ${region.name}`,
                                );
                            } else if (
                                this.cars[index].state &&
                                !this.isPointInBounds(point, bounds) &&
                                this.cars[index].region_id === region._id
                            ) {
                                console.log(
                                    `Xe ${this.cars[index].vid} đi ra ${region.name}`,
                                );
                            }
                            this.cars[index].state = this.isPointInBounds(
                                point,
                                bounds,
                            );
                        }
                        // console.log(this.cars);
                        // this.cars.push({

                        // })
                        // if (this.isPointInBounds(point, bounds)) {
                        //     console.log(
                        //         `Xe ${data[0]?.vid} đang nằm trong vùng ${region.name}`,
                        //     );
                        // } else {
                        //     console.log(
                        //         `Xe ${data[0]?.vid} đang nằm ngoài vùng ${region.name}`,
                        //     );
                        // }
                    }
                });
                // tạo một mảng add các xe vào
                // if trạng thái ra vào của xe thay đổi xe add vào record và cập nhập lại trạng thái của xe
                // record: {id, region_id, create_time, update_time, isDeleted, in_time, out_time, vid, v_name}
            }
        } catch (error) {}
    }
}

module.exports = new APIController();
