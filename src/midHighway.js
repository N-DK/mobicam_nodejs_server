const midHighWay = require('./mid_highway');

midHighWay.init();

midHighWay.track('warning', (payload) => {
    console.log('track', payload);
});
