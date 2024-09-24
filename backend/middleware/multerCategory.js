const multer = require('multer');
const path = require('path');

// ตั้งค่าการจัดเก็บไฟล์สำหรับหมวดหมู่
const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/categories/'); // เส้นทางโฟลเดอร์ categories
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // ตั้งชื่อไฟล์โดยใช้ timestamp
  }
});

const uploadCategory = multer({ storage: categoryStorage });

module.exports = uploadCategory;
