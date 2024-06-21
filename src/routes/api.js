const express = require('express');
const router = express.Router();
const api = require('../app/controllers/APIController');
const { verifyUser } = require('../middleware');

router.get('/region/get', verifyUser, api.get);
router.get('/region/get/record', verifyUser, api.record);
router.post('/region/add', verifyUser, api.add);
router.patch('/region/edit', verifyUser, api.edit);
router.patch('/region/delete', verifyUser, api.delete);

module.exports = router;
