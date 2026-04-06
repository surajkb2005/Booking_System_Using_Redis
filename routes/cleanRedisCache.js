const express = require('express');
const router = express.Router();
const cleanCache = require('../controller/cleanCacheController');

router.post('/', cleanCache.cleanRedisCache);

module.exports = router;