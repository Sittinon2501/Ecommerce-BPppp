const express = require('express');
const router = express.Router();
const { register, login, getUser } = require('../controllers/userController'); // ตรวจสอบการ import ฟังก์ชันที่ถูกต้อง

router.post('/register', register);
router.post('/login', login);
router.get('/:id', getUser); // เพิ่มเส้นทางสำหรับดึงข้อมูลผู้ใช้

module.exports = router;
