const { isPointInBounds, isPointInCircle } = require('../utils');
// if use circle to draw will use isPointInCircle(center, point, radius)
// if use api, will use (1) else if collection highway use (2)
// collection highway
// highway_id:string, highway_name:string, regions: geometry: number[][], max_speed: number, min_speed: number, lanes: number

const warningHighWay = (cars, io, highways, message) => {
    try {
        const data = JSON.parse(message.toString());
        const point = data[0]?.gps.split(',').map(Number);

        highways.forEach((way) => {
            const carIndex = cars?.findIndex(
                (car) =>
                    car.vid === data[0]?.vid &&
                    car.highway_id === way.highway_id,
            );

            const inBounds = way.regions.some((region) =>
                // circle
                // region.geometry.some((geo) =>
                //     isPointInCircle(geo, 50, point),
                // ),
                isPointInBounds(point, region.geometry),
            );

            if (cars.length === 0 || carIndex === -1) {
                cars.push({
                    highway_id: way.highway_id,
                    highway_name: way.highway_name,
                    vid: data[0]?.vid,
                    dev_id: data[0]?.id,
                    state: inBounds,
                });
            } else {
                const car = cars[carIndex];
                const payload = {
                    vid: car.vid,
                    highway_name: way.highway_name,
                    max_speed: way.max_speed,
                    min_speed: way.min_speed,
                    ref: way.ref,
                };
                if (
                    !car.state &&
                    inBounds &&
                    car.highway_id === way.highway_id
                ) {
                    io.emit('warning', {
                        ...payload,
                        message: `Xe ${car.vid} đi vào ${way.highway_name}`,
                        type: 1,
                    });
                    console.log(`Xe ${car.vid} đi vào ${way.highway_name}`);
                } else if (
                    car.state &&
                    !inBounds &&
                    car.highway_id === way.highway_id
                ) {
                    io.emit('warning', {
                        ...payload,
                        message: `Xe ${car.vid} đi ra ${way.highway_name}`,
                        type: 0,
                    });
                    console.log(`Xe ${car.vid} đi ra ${way.highway_name}`);
                }
                car.state = inBounds;
            }
        });
    } catch (error) {}
    // Lấy điểm đầu điểm cuối của regions theo highway
    // inBounds điểm vào là đi vào
    // inBounds từ điểm cuối if(inBound điểm cuối là false là đi ra từ điểm cuối)
    // lưu index của regions vào car
    // if(index === điểm cuối && state && inBounds) => đi ra từ điểm cuối
};

module.exports = { warningHighWay };
