const express = require('express');
const { getAllOrders, updateOrderStatus,getUserOrders } = require('../controllers/orderController');
const router = express.Router();

router.get('/user/:userId', getUserOrders); // เส้นทางสำหรับดึงคำสั่งซื้อของผู้ใช้
// เส้นทางสำหรับดึงรายการคำสั่งซื้อทั้งหมด (เฉพาะ admin)
router.get('/admin', getAllOrders);
// เส้นทางสำหรับอัปเดตสถานะคำสั่งซื้อ
router.put('/admin/:orderId/status', updateOrderStatus);

module.exports = router;
