const {
    isPointInBounds,
    isPointInCircle,
    isPointInHighway,
} = require('../utils');

const warningHighWay = (cars, io, highways, message) => {
    try {
        const data = JSON.parse(message.toString());
        const point = data[0]?.gps?.split(',').map(Number);

        // highway_new_version
        // highways.forEach((ref) => {
        //     ref.highways.forEach((highway) => {
        //         const dataVid = data[0]?.vid;
        //         const dataId = data[0]?.id;

        //         const carIndex = cars.findIndex((car) => {
        //             return car.vid === dataVid && car.highway_id === highway.id;
        //         });

        //         const inBounds = highway.ways.some((way) =>
        //             isPointInBounds(point, way.buffer_geometry),
        //         );
        //         if (carIndex === -1) {
        //             cars.push({
        //                 highway_name: highway.highway_name,
        //                 highway_id: highway.id,
        //                 vid: dataVid,
        //                 dev_id: dataId,
        //                 state: inBounds,
        //                 ref: ref.ref,
        //             });
        //         } else {
        //             const car = cars[carIndex];
        //             if (car.highway_id === highway.id) {
        //                 const isInWarning = !car.state && inBounds;
        //                 const isOutWarning = car.state && !inBounds;

        //                 const payload = {
        //                     vid: car.vid,
        //                     highway_name: highway.highway_name,
        //                     ref: ref.ref,
        //                 };

        //                 if (isInWarning) {
        //                     io.emit('warning', {
        //                         ...payload,
        //                         message: `Xe ${car.vid} đi vào ${highway.highway_name}`,
        //                         type: 1,
        //                         in_time: Date.now(),
        //                     });
        //                     console.log(
        //                         `Xe ${car.vid} đi vào ${highway.highway_name}`,
        //                     );
        //                 } else if (isOutWarning) {
        //                     io.emit('warning', {
        //                         ...payload,
        //                         message: `Xe ${car.vid} đi ra ${highway.highway_name}`,
        //                         type: 0,
        //                         out_time: Date.now(),
        //                     });
        //                     console.log(
        //                         `Xe ${car.vid} đi ra ${highway.highway_name}`,
        //                     );
        //                 }
        //                 car.state = inBounds;
        //             }
        //         }
        //         // console.log(cars);
        //     });
        // });

        highways?.forEach((ref) => {
            const carIndex = cars.findIndex(
                (car) => car.vid === data[0]?.vid && car.ref_id.equals(ref._id),
            );

            const inBounds = ref.highways.some((highway) =>
                highway.ways.some((way) =>
                    isPointInBounds(point, way.buffer_geometry),
                ),
            );

            // const inBounds = isPointInHighway(point, way.regions);

            if (cars.length === 0 || carIndex === -1) {
                cars.push({
                    ref_id: ref._id,
                    vid: data[0]?.vid,
                    dev_id: data[0]?.id,
                    state: inBounds,
                });
            } else {
                const car = cars[carIndex];
                // if (inBounds) {
                //     console.log(`Xe ${car.vid} trong ${ref.ref}`);
                // } else {
                //     console.log(`Xe ${car.vid} ngoài ${ref.ref}`);
                // }
                if (car.ref_id.equals(ref._id)) {
                    const isInWarning = !car.state && inBounds;
                    const isOutWarning = car.state && !inBounds;
                    const payload = {
                        vid: car.vid,
                        // max_speed: way.max_speed,
                        // min_speed: way.min_speed,
                        ref: ref.ref,
                    };

                    if (isInWarning) {
                        io.emit('warning', {
                            ...payload,
                            message: `Xe ${car.vid} đi vào ${ref.ref}`,
                            type: 1,
                            in_time: Date.now(),
                        });
                        console.log(`Xe ${car.vid} đi vào ${ref.ref}`);
                    } else if (isOutWarning) {
                        io.emit('warning', {
                            ...payload,
                            message: `Xe ${car.vid} đi ra ${ref.ref}`,
                            type: 0,
                            out_time: Date.now(),
                        });
                        console.log(`Xe ${car.vid} đi ra ${ref.ref}`);
                    }
                    car.state = inBounds;
                }
            }
            // console.log(cars.length);
        });

        // highways.forEach((way) => {
        //     way.regions.forEach((region, index) => {
        // const dataVid = data[0]?.vid;
        // const dataId = data[0]?.id;

        //         if (!dataVid) return;

        //         const carIndex = cars.findIndex(
        //             (car) =>
        //                 car.vid === dataVid &&
        //                 car.region_name === region.region_name,
        //         );
        //         const inBounds = region.buffer_geometry.some((geometry) =>
        //             isPointInBounds(point, geometry),
        //         );
        //         // const inBounds = isPointInBounds(point, region.geometry);

        //         if (carIndex === -1) {
        //             cars.push({
        //                 index: cars.length + 1,
        //                 region_name: region.region_name,
        //                 region_id: region.region_id,
        //                 vid: dataVid,
        //                 dev_id: dataId,
        //                 state: inBounds,
        //                 ref: way.ref,
        //             });
        //         } else {
        //             const car = cars[carIndex];
        //             if (car.region_name === region.region_name) {
        //                 const isInWarning = !car.state && inBounds;
        //                 const isOutWarning = car.state && !inBounds;

        //                 const payload = {
        //                     vid: car.vid,
        //                     highway_name: region.region_name,
        //                     max_speed: way.max_speed,
        //                     min_speed: way.min_speed,
        //                     ref: way.ref,
        //                 };

        //                 if (isInWarning) {
        //                     io.emit('warning', {
        //                         ...payload,
        //                         message: `Xe ${car.vid} đi vào ${region.region_name}`,
        //                         type: 1,
        //                         in_time: Date.now(),
        //                     });
        //                     console.log(
        //                         `Xe ${car.vid} đi vào ${region.region_name}`,
        //                     );
        //                 } else if (isOutWarning) {
        //                     io.emit('warning', {
        //                         ...payload,
        //                         message: `Xe ${car.vid} đi ra ${region.region_name}`,
        //                         type: 0,
        //                         out_time: Date.now(),
        //                     });
        //                     console.log(
        //                         `Xe ${car.vid} đi ra ${region.region_name}`,
        //                     );
        //                 }
        //                 car.state = inBounds;
        //             }
        //         }
        //     });
        // });

        // highways?.forEach((way, index) => {
        //     const carIndex = cars?.findIndex(
        //         (car) =>
        //             car.vid === data[0]?.vid &&
        //             car.highway_id === way.highway_id,
        //     );

        //     const inBounds = way.regions.some((region) =>
        //         region.buffer_geometry.some((geometry) =>
        //             isPointInBounds(point, geometry),
        //         ),
        //     );

        //     // const inBounds = isPointInHighway(point, way.regions);

        //     if (cars.length === 0 || carIndex === -1) {
        //         cars.push({
        //             highway_id: way.highway_id,
        //             vid: data[0]?.vid,
        //             dev_id: data[0]?.id,
        //             state: inBounds,
        //         });
        //     } else {
        //         const car = cars[carIndex];
        //         if (inBounds) {
        //             console.log(`Xe ${car.vid} trong ${way.ref}`);
        //         } else {
        //             console.log(`Xe ${car.vid} ngoài ${way.ref}`);
        //         }
        //         if (car.highway_id === way.highway_id) {
        //             const isInWarning = !car.state && inBounds;
        //             const isOutWarning = car.state && !inBounds;
        //             const payload = {
        //                 vid: car.vid,
        //                 max_speed: way.max_speed,
        //                 min_speed: way.min_speed,
        //                 ref: way.ref,
        //             };

        //             if (isInWarning) {
        //                 io.emit('warning', {
        //                     ...payload,
        //                     message: `Xe ${car.vid} đi vào ${way.highway_name}`,
        //                     type: 1,
        //                     in_time: Date.now(),
        //                 });
        //                 console.log(`Xe ${car.vid} đi vào ${way.highway_name}`);
        //             } else if (isOutWarning) {
        //                 io.emit('warning', {
        //                     ...payload,
        //                     message: `Xe ${car.vid} đi ra ${way.highway_name}`,
        //                     type: 0,
        //                     out_time: Date.now(),
        //                 });
        //                 console.log(`Xe ${car.vid} đi ra ${way.highway_name}`);
        //             }
        //             car.state = inBounds;
        //         }
        //     }
        //     // console.log(cars.length);
        // });
    } catch (error) {
        // console.log(error);
    }
};

module.exports = { warningHighWay };
