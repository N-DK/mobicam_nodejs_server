const turf = require('@turf/turf');
const geolib = require('geolib');

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (angle) => angle * (Math.PI / 180);

    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
};

function isPointInCircle(center, r, point) {
    const [x, y] = center;
    const x1 = Number(point[0]),
        y1 = Number(point[1]);
    const distance = haversineDistance(x, y, x1, y1) * 1000;
    return distance <= r;
}

function isPointInBounds(point, bounds) {
    const x = Number(point[0]),
        y = Number(point[1]);
    let inside = false;
    for (let i = 0, j = bounds.length - 1; i < bounds.length; j = i++) {
        const xi = bounds[i][0],
            yi = bounds[i][1];
        const xj = bounds[j][0],
            yj = bounds[j][1];

        const intersect =
            yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}

// function isPointInHighway(point, regions) {
//     for (const region of regions) {
//         // Đảo ngược tọa độ từ [latitude, longitude] sang [longitude, latitude]
//         // console.log(region.bufferedGeometry.geometry.coordinates);
//         const coordinates = region.bufferedGeometry.geometry.coordinates[0].map(
//             (geo) => ({
//                 latitude: geo[0],
//                 longitude: geo[1],
//             }),
//         );
//         console.log(coordinates);
//         if (
//             geolib.isPointInPolygon(
//                 { latitude: point[0], longitude: point[1] },
//                 coordinates,
//             )
//         ) {
//             return true;
//         }
//     }
//     return false;
// }

// function isPointInHighway(point, region) {
//     const pt = turf.point(point);
//     const line = turf.lineString(region.geometry);
//     return turf.booleanPointOnLine(pt, line, { epsilon: 1e-6 });
// }

// function isPointInHighway(point, regions) {
//     const pt = turf.point(point);
//     for (const region of regions) {
//         if (turf.booleanPointInPolygon(pt, region.bufferedGeometry)) {
//             return true;
//         }
//     }
//     return false;
// }

function isPointInHighway(point, regions) {
    const pt = turf.point(point);
    for (const region of regions) {
        const line = turf.lineString(region.buffer_geometry);
        if (turf.booleanPointOnLine(pt, line, { epsilon: 1e-6 })) {
            return true;
        }
    }
    return false;
}

// function isPointInHighway(point, regions) {
//     const pt = turf.point(point);

//     for (const region of regions) {
//         const line = turf.lineString(region.geometry);

//         // Sử dụng hộp bao quanh (bounding box) để kiểm tra nhanh trước
//         const bbox = turf.bbox(line);
//         const bboxPolygon = turf.bboxPolygon(bbox);
//         if (!turf.booleanPointInPolygon(pt, bboxPolygon)) {
//             continue;
//         }

//         // Tạo vùng đệm và kiểm tra điểm
//         const bufferedLine = turf.buffer(line, 10, { units: 'meters' });
//         if (turf.booleanPointInPolygon(pt, bufferedLine)) {
//             return true;
//         }
//     }

//     return false;
// }

// highway_super
// function isPointInHighway(point, highways) {
//     const pt = turf.point([point[1], point[0]]);
//     for (const highway of highways) {
//         const line = turf.lineString(
//             highway.geometry.map((coord) => [coord.lon, coord.lat]),
//         );
//         if (turf.booleanPointOnLine(pt, line, { epsilon: 5e-8 })) {
//             return true;
//         }
//     }
//     return false;
// }

module.exports = {
    haversineDistance,
    isPointInCircle,
    isPointInBounds,
    isPointInHighway,
};
