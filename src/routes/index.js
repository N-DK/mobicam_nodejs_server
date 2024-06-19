const apiRouter = require('../routes/api');

function route(app) {
    app.use('/api', apiRouter);
}

module.exports = route;
