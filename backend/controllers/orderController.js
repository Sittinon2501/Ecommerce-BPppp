const { poolPromise } = require("../db");

// แก้ไขการดึงราคาสินค้าจาก OrderItems แทน Products
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

// แก้ไขการดึงราคาสินค้าจาก OrderItems แทน Products
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
    await pool
      .request()
      .input("OrderId", orderId)
      .input("Status", "Cancelled") // เปลี่ยนสถานะเป็น Cancelled
      .query("UPDATE Orders SET Status = @Status WHERE OrderId = @OrderId");

    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling order", error });
  }
};
