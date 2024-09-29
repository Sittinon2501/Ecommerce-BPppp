const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');


// เส้นทางสำหรับรายงานสินค้าขายดี
router.get('/top-selling-products', reportController.getTopSellingProductsReport);

// เส้นทางสำหรับรายงานสินค้าที่ขายไม่ดี
router.get('/low-selling-products', reportController.getLowSellingProductsReport);
// เส้นทางสำหรับรายงานรายได้
router.get('/revenue-report', reportController.getRevenueReport);

module.exports = router;
