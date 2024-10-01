const express = require("express");
const {
  getCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
  getCategoriesWithPagination,
} = require("../controllers/categoryController");
const uploadCategory = require("../middleware/multerCategory"); // นำเข้าการตั้งค่า multer สำหรับหมวดหมู่

const router = express.Router();

// เส้นทาง API สำหรับการจัดการหมวดหมู่
router.get("/", getCategories);
router.get('/pagination', getCategoriesWithPagination); // ดึงหมวดหมู่ทั้งหมดพร้อม Pagination
router.get("/:id", getCategoryById);
router.post("/", uploadCategory.single("image"), addCategory); // เพิ่ม middleware สำหรับการอัปโหลดไฟล์
router.put("/:id", uploadCategory.single("image"), updateCategory); // เพิ่ม middleware สำหรับการอัปโหลดไฟล์
router.delete("/:id", deleteCategory);

module.exports = router;
