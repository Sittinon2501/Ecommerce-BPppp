const express = require('express');
const {
  getProducts,
  getProductById,
  addProduct,
  deleteProduct,
  updateProduct,
} = require('../controllers/productController');
const multer = require('multer');

const router = express.Router();

// ตั้งค่า multer สำหรับจัดการไฟล์ที่อัปโหลด
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // โฟลเดอร์ที่ใช้เก็บไฟล์อัปโหลด
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // ตั้งชื่อไฟล์โดยใช้ timestamp
  }
});

const upload = multer({ storage: storage });

// เส้นทาง API สำหรับการจัดการสินค้า
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', upload.single('image'), addProduct); // เพิ่ม middleware สำหรับการอัปโหลดไฟล์
router.put('/:id', upload.single('image'), updateProduct); // เพิ่ม middleware สำหรับการอัปโหลดไฟล์
router.delete('/:id', deleteProduct);

module.exports = router;
