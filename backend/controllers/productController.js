const { poolPromise } = require('../db');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

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

// ดึงสินค้าทั้งหมด
exports.getProducts = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Products');
    res.json(result.recordset); // ตรวจสอบว่ามี ImageUrl ในข้อมูลที่ส่งกลับ
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ดึงสินค้าพร้อม Pagination
exports.getProductsWithPagination = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const categoryId = req.query.categoryId;

  try {
    const pool = await poolPromise;
    let query = `
      SELECT * FROM Products
      ${categoryId ? 'WHERE CategoryId = @CategoryId' : ''}
      ORDER BY ProductId
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY;
    `;

    const result = await pool.request()
      .input('CategoryId', categoryId)
      .query(query);

    // Calculate total products for pagination
    const totalQuery = `
      SELECT COUNT(*) as total FROM Products
      ${categoryId ? 'WHERE CategoryId = @CategoryId' : ''};
    `;
    const totalResult = await pool.request()
      .input('CategoryId', categoryId)
      .query(totalQuery);

    res.json({
      data: result.recordset,
      currentPage: page,
      totalPages: Math.ceil(totalResult.recordset[0].total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ดึงสินค้าตาม ID
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ProductId', id)
      .query('SELECT * FROM Products WHERE ProductId = @ProductId');
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// เพิ่มสินค้า
exports.addProduct = async (req, res) => {
  const { ProductName, Description, Price, Stock, CategoryId } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

  if (!ProductName || !Price || !Stock || !CategoryId) {
    return res.status(400).json({ message: 'All fields are required, including an image' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('ProductName', ProductName)
      .input('Description', Description)
      .input('Price', Price)
      .input('Stock', Stock)
      .input('CategoryId', CategoryId)
      .input('ImageUrl', imageUrl)
      .query(`INSERT INTO Products (ProductName, Description, Price, Stock, CategoryId, ImageUrl) VALUES (@ProductName, @Description, @Price, @Stock, @CategoryId, @ImageUrl)`);

    res.status(201).json({ message: 'Product added successfully' });
  } catch (err) {
    console.error('Error in addProduct:', err);
    res.status(500).json({ message: err.message });
  }
};


// แก้ไขสินค้า
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { ProductName, Description, Price, Stock, CategoryId } = req.body;
  let imageUrl = req.body.imageUrl;
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('ProductId', id)
      .input('ProductName', ProductName)
      .input('Description', Description)
      .input('Price', Price)
      .input('Stock', Stock)
      .input('CategoryId', CategoryId)
      .input('ImageUrl', imageUrl)
      .query(`UPDATE Products SET ProductName = @ProductName, Description = @Description, Price = @Price, Stock = @Stock, CategoryId = @CategoryId, ImageUrl = @ImageUrl WHERE ProductId = @ProductId`);

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ลบสินค้า
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('ProductId', id)
      .query('DELETE FROM Products WHERE ProductId = @ProductId');
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err); // เพิ่มการ log ข้อผิดพลาด
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
};
