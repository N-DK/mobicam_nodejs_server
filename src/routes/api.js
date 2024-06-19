const express = require('express');
const router = express.Router();
const api = require('../app/controllers/APIController');
const { verifyUser } = require('../middleware');

router.get('/region/get', verifyUser, api.get);
router.get('/region/get/record', verifyUser, api.record);
router.post('/region/add', verifyUser, api.add);

module.exports = router;
