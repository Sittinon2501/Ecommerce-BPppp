const express = require('express');
const { addAdmin } = require('../controllers/adminController');
const router = express.Router();

// Route สำหรับเพิ่ม admin
router.post('/add-admin', addAdmin);

module.exports = router;
