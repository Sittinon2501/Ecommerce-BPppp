const express = require("express");
const {
  getAllOrders,
  updateOrderStatus,
  getUserOrders,
  cancelOrder,
  getOrderHistory,
} = require("../controllers/orderController");
const router = express.Router();

router.get("/user/:userId", getUserOrders); // เส้นทางสำหรับดึงคำสั่งซื้อของผู้ใช้
// เส้นทางสำหรับดึงรายการคำสั่งซื้อทั้งหมด (เฉพาะ admin)
router.get("/admin", getAllOrders);
// เส้นทางสำหรับอัปเดตสถานะคำสั่งซื้อ
router.put("/admin/:orderId/status", updateOrderStatus);
router.put("/cancel/:orderId", cancelOrder);
router.get("/history/:userId", getOrderHistory); // เพิ่มเส้นทางสำหรับดึงประวัติคำสั่งซื้อ

module.exports = router;
