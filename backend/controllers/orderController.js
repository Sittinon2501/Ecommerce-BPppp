const { poolPromise } = require("../db");

// ดึงคำสั่งซื้อของผู้ใช้ตาม userId
exports.getUserOrders = async (req, res) => {
  const userId = req.params.userId; // ดึง userId จาก params
  try {
    const pool = await poolPromise;
    const result = await pool.request().input("UserId", userId).query(`
        SELECT Orders.OrderId, Orders.TotalAmount, Orders.OrderDate, Orders.Status, 
               OrderItems.Quantity, Products.ProductName, Products.Price, Products.ImageUrl 
        FROM Orders
        JOIN OrderItems ON Orders.OrderId = OrderItems.OrderId
        JOIN Products ON OrderItems.ProductId = Products.ProductId
        WHERE Orders.UserId = @UserId
      `);

    res.status(200).json(result.recordset); // ส่งข้อมูลกลับไปที่ frontend
  } catch (error) {
    res.status(500).json({ message: "Error fetching user orders", error });
  }
};

// ดึงรายการคำสั่งซื้อทั้งหมด
exports.getAllOrders = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT Orders.OrderId, Orders.TotalAmount, Orders.OrderDate, Orders.Status, 
             OrderItems.Quantity, Products.ProductName, Products.Price, Products.ImageUrl 
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
