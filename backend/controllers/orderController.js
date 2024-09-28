const { poolPromise } = require("../db");

// ดึงข้อมูลคำสั่งซื้อของผู้ใช้
exports.getUserOrders = async (req, res) => {
  const userId = req.params.userId;
  try {
    const pool = await poolPromise;
    const result = await pool.request().input("UserId", userId).query(`
      SELECT Orders.OrderId, Orders.TotalAmount, Orders.OrderDate, Orders.Status, 
             OrderItems.Quantity, OrderItems.Price, Products.ProductName, Products.ImageUrl 
      FROM Orders
      JOIN OrderItems ON Orders.OrderId = OrderItems.OrderId
      JOIN Products ON OrderItems.ProductId = Products.ProductId
      WHERE Orders.UserId = @UserId
    `);

    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user orders", error });
  }
};

// ดึงข้อมูลคำสั่งซื้อทั้งหมด
exports.getAllOrders = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT Orders.OrderId, Orders.TotalAmount, Orders.OrderDate, Orders.Status, 
             OrderItems.Quantity, OrderItems.Price, Products.ProductName, Products.ImageUrl 
      FROM Orders
      JOIN OrderItems ON Orders.OrderId = OrderItems.OrderId
      JOIN Products ON OrderItems.ProductId = Products.ProductId
    `);

    res.status(200).json(result.recordset);
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
exports.getOrderHistory = async (req, res) => {
  const userId = req.params.userId; // สมมติว่าดึงคำสั่งซื้อของผู้ใช้ที่ระบุ
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
    `);

    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order history", error });
  }
};
