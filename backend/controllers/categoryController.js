const { poolPromise } = require('../db');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const uploadCategory = require('../middleware/multerCategory');
// ตรวจสอบว่าโฟลเดอร์ uploads ถูกสร้างแล้วหรือไม่ ถ้ายังไม่มี ให้สร้างขึ้น
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// ตั้งค่า multer สำหรับการจัดการอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // เส้นทางโฟลเดอร์ uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // ตั้งชื่อไฟล์โดยใช้ timestamp
  }
});

const upload = multer({ storage: storage });

// ดึงหมวดหมู่ทั้งหมด
exports.getCategories = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Categories');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ดึงหมวดหมู่ทั้งหมดพร้อม Pagination
exports.getCategoriesWithPagination = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // หน้าเริ่มต้น
  const limit = parseInt(req.query.limit) || 6; // จำนวนรายการต่อหน้า
  const offset = (page - 1) * limit; // คำนวณ offset

  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT * FROM Categories 
      ORDER BY CategoryId 
      OFFSET ${offset} ROWS 
      FETCH NEXT ${limit} ROWS ONLY
    `);

    // ดึงจำนวนหมวดหมู่ทั้งหมด
    const totalCategoriesResult = await pool.request().query('SELECT COUNT(*) as total FROM Categories');
    const totalCategories = totalCategoriesResult.recordset[0].total;

    res.status(200).json({
      data: result.recordset,
      currentPage: page,
      totalPages: Math.ceil(totalCategories / limit),
      totalCategories: totalCategories,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ดึงหมวดหมู่ตาม ID
exports.getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('CategoryId', id)
      .query('SELECT * FROM Categories WHERE CategoryId = @CategoryId');
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// เพิ่มหมวดหมู่
exports.addCategory = async (req, res) => {
  const { CategoryName } = req.body;
  const imageUrl = req.file ? `/uploads/categories/${req.file.filename}` : ''; // ใช้ URL ของรูปภาพที่ถูกอัปโหลด

  if (!CategoryName || !imageUrl) {
    return res.status(400).json({ message: 'Category name and image are required' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('CategoryName', CategoryName)
      .input('ImageUrl', imageUrl)
      .query(`INSERT INTO Categories (CategoryName, ImageUrl) VALUES (@CategoryName, @ImageUrl)`);

    res.status(201).json({ message: 'Category added successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// แก้ไขหมวดหมู่
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { CategoryName } = req.body;

  let imageUrl = req.body.imageUrl;
  if (req.file) {
    imageUrl = `/uploads/categories/${req.file.filename}`;
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('CategoryId', id)
      .input('CategoryName', CategoryName)
      .input('ImageUrl', imageUrl)
      .query(`UPDATE Categories SET CategoryName = @CategoryName, ImageUrl = @ImageUrl WHERE CategoryId = @CategoryId`);

    res.status(200).json({ message: 'Category updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ลบหมวดหมู่
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('CategoryId', id)
      .query('DELETE FROM Categories WHERE CategoryId = @CategoryId');
    
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
