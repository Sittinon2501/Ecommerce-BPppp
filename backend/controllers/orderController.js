const { poolPromise } = require("../db");

// ดึงข้อมูลคำสั่งซื้อของผู้ใช้

// ดึงข้อมูลคำสั่งซื้อของผู้ใช้พร้อม Pagination โดยกรองคำสั่งซื้อที่มีสถานะ 'Delivered Successfully' และ 'Cancelled'
exports.getUserOrders = async (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;  // หน้าเริ่มต้นคือ 1
  const limit = parseInt(req.query.limit) || 10;  // จำนวนข้อมูลต่อหน้า
  const offset = (page - 1) * limit;  // คำนวณการข้ามข้อมูล (offset)

  try {
    const pool = await poolPromise;
    // ดึงข้อมูลคำสั่งซื้อที่ไม่ใช่ 'Delivered Successfully' หรือ 'Cancelled'
    const result = await pool.request().input("UserId", userId).query(`
      SELECT Orders.OrderId, Orders.TotalAmount, Orders.OrderDate, Orders.Status, 
             OrderItems.Quantity, OrderItems.Price, Products.ProductName, Products.ImageUrl 
      FROM Orders
      JOIN OrderItems ON Orders.OrderId = OrderItems.OrderId
      JOIN Products ON OrderItems.ProductId = Products.ProductId
      WHERE Orders.UserId = @UserId
        AND Orders.Status NOT IN ('Delivered Successfully', 'Cancelled')  -- กรองคำสั่งซื้อที่ไม่ต้องการ
      ORDER BY Orders.OrderDate DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;
    `);

    // ดึงจำนวนรายการคำสั่งซื้อที่ไม่ใช่ 'Delivered Successfully' และ 'Cancelled'
    const totalOrdersResult = await pool.request().input("UserId", userId).query(`
      SELECT COUNT(*) as total 
      FROM Orders 
      WHERE Orders.UserId = @UserId
        AND Orders.Status NOT IN ('Delivered Successfully', 'Cancelled')
    `);
    const totalOrders = totalOrdersResult.recordset[0].total;

    res.status(200).json({
      data: result.recordset,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders: totalOrders,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user orders", error });
  }
};


// ดึงข้อมูลคำสั่งซื้อทั้งหมด
// ดึงข้อมูลคำสั่งซื้อทั้งหมดพร้อม Pagination (สำหรับ Admin)
exports.getAllOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;  // หน้าเริ่มต้นคือ 1
  const limit = parseInt(req.query.limit) || 10;  // จำนวนข้อมูลต่อหน้า
  const offset = (page - 1) * limit;  // คำนวณการข้ามข้อมูล (offset)

  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT Orders.OrderId, Orders.TotalAmount, Orders.OrderDate, Orders.Status, 
             OrderItems.Quantity, OrderItems.Price, Products.ProductName, Products.ImageUrl 
      FROM Orders
      JOIN OrderItems ON Orders.OrderId = OrderItems.OrderId
      JOIN Products ON OrderItems.ProductId = Products.ProductId
      ORDER BY Orders.OrderDate DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;
    `);

    // ดึงจำนวนรายการทั้งหมด
    const totalOrdersResult = await pool.request().query(`SELECT COUNT(*) as total FROM Orders`);
    const totalOrders = totalOrdersResult.recordset[0].total;

    res.status(200).json({
      data: result.recordset,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders: totalOrders,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

// อัปเดตสถานะคำสั่งซื้อ
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const { orderId } = req.params;

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("OrderId", orderId)
      .input("Status", status)
      .query("UPDATE Orders SET Status = @Status WHERE OrderId = @OrderId");

    res.json({ message: "Order status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error });
  }
};

// ยกเลิกคำสั่งซื้อ
exports.cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const pool = await poolPromise;

    // Step 1: ตรวจสอบสถานะปัจจุบันของคำสั่งซื้อ
    const orderStatusResult = await pool
      .request()
      .input("OrderId", orderId)
      .query("SELECT Status FROM Orders WHERE OrderId = @OrderId");

    const currentStatus = orderStatusResult.recordset[0]?.Status;

    // Step 2: อนุญาตให้ยกเลิกได้เฉพาะคำสั่งซื้อที่มีสถานะ 'Pending'
    if (currentStatus !== "Pending") {
      return res.status(400).json({
        message: "ไม่สามารถยกเลิกคำสั่งซื้อได้ คำสั่งซื้อที่สามารถยกเลิกได้ต้องมีสถานะ 'Pending' เท่านั้น.",
      });
    }

    // Step 3: ดำเนินการยกเลิกคำสั่งซื้อหากสถานะเป็น 'Pending'
    await pool
      .request()
      .input("OrderId", orderId)
      .input("Status", "Cancelled")
      .query("UPDATE Orders SET Status = @Status WHERE OrderId = @OrderId");

    res.json({ message: "ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว" });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling order", error });
  }
};

// ดึงข้อมูลประวัติคำสั่งซื้อ (Delivered Successfully และ Cancelled)
// ดึงข้อมูลประวัติคำสั่งซื้อ (Delivered Successfully และ Cancelled) พร้อม Pagination
exports.getOrderHistory = async (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const pool = await poolPromise;
    const result = await pool.request().input("UserId", userId).query(`
      SELECT Orders.OrderId, Orders.TotalAmount, Orders.OrderDate, Orders.Status, 
             OrderItems.Quantity, OrderItems.Price, Products.ProductName, Products.ImageUrl 
      FROM Orders
      JOIN OrderItems ON Orders.OrderId = OrderItems.OrderId
      JOIN Products ON OrderItems.ProductId = Products.ProductId
      WHERE Orders.UserId = @UserId 
        AND (Orders.Status = 'Delivered Successfully' OR Orders.Status = 'Cancelled')
      ORDER BY Orders.OrderDate DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;
    `);

    // ดึงจำนวนรายการทั้งหมด
    const totalOrdersResult = await pool.request().input("UserId", userId).query(`
      SELECT COUNT(*) as total FROM Orders 
      WHERE Orders.UserId = @UserId 
        AND (Orders.Status = 'Delivered Successfully' OR Orders.Status = 'Cancelled')
    `);
    const totalOrders = totalOrdersResult.recordset[0].total;

    res.status(200).json({
      data: result.recordset,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders: totalOrders,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order history", error });
  }
};
