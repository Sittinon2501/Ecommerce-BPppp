const { poolPromise } = require("../db");

// เพิ่มรายการในตะกร้า
// เพิ่มรายการในตะกร้า
exports.addCartItem = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const pool = await poolPromise;

    // ตรวจสอบ stock ก่อนเพิ่มสินค้า
    const product = await pool
      .request()
      .input("ProductId", productId)
      .query("SELECT Stock FROM Products WHERE ProductId = @ProductId");

    if (product.recordset[0].Stock === 0) {
      return res.status(400).json({ message: "This product is out of stock" });
    }

    if (product.recordset[0].Stock < quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient stock for this product" });
    }

    // ตรวจสอบว่ามีสินค้าชนิดนี้ในตะกร้าหรือยัง
    const existingItem = await pool
      .request()
      .input("UserId", userId)
      .input("ProductId", productId)
      .query(
        "SELECT * FROM Cart WHERE UserId = @UserId AND ProductId = @ProductId"
      );

    if (existingItem.recordset.length > 0) {
      // อัปเดตจำนวนสินค้าในตะกร้า
      await pool
        .request()
        .input("CartId", existingItem.recordset[0].CartId)
        .input("Quantity", existingItem.recordset[0].Quantity + quantity)
        .query("UPDATE Cart SET Quantity = @Quantity WHERE CartId = @CartId");
    } else {
      // เพิ่มสินค้าใหม่ในตะกร้า
      await pool
        .request()
        .input("UserId", userId)
        .input("ProductId", productId)
        .input("Quantity", quantity)
        .query(
          "INSERT INTO Cart (UserId, ProductId, Quantity) VALUES (@UserId, @ProductId, @Quantity)"
        );
    }

    res.status(201).json({ message: "Item added to cart successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// รับข้อมูลตะกร้าสำหรับผู้ใช้
exports.getCartItems = async (req, res) => {
  const userId = req.params.userId;
  try {
    const pool = await poolPromise;
    const result = await pool.request().input("UserId", userId).query(`
        SELECT Cart.CartId, Cart.ProductId, Cart.Quantity, Cart.UserId, 
               Products.ProductName, Products.Price, Products.ImageUrl  -- Ensure ImageUrl is selected
        FROM Cart
        JOIN Products ON Cart.ProductId = Products.ProductId
        WHERE Cart.UserId = @UserId
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ลบสินค้าออกจากตะกร้า
exports.removeCartItem = async (req, res) => {
  const cartId = req.params.id;

  // ตรวจสอบว่ามี cartId หรือไม่
  if (!cartId) {
    return res.status(400).json({ message: "CartId is required." });
  }

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("CartId", cartId)
      .query(`DELETE FROM Cart WHERE CartId = @CartId`);
    res.status(200).json({ message: "Item removed from cart successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error removing item from cart: " + err.message });
  }
};

// อัปเดตจำนวนในตะกร้า
exports.updateCartItem = async (req, res) => {
  const cartId = req.params.id;
  const { quantity } = req.body;

  // ตรวจสอบว่ามี cartId และ quantity หรือไม่
  if (!cartId || quantity === undefined) {
    return res
      .status(400)
      .json({ message: "CartId and Quantity are required." });
  }

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("CartId", cartId)
      .input("Quantity", quantity)
      .query(`UPDATE Cart SET Quantity = @Quantity WHERE CartId = @CartId`);
    res.status(200).json({ message: "Cart item updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating cart item: " + err.message });
  }
};

// ลบเฉพาะรายการที่ถูก checkout ออกจากตะกร้า
exports.checkout = async (req, res) => {
  const { items, total, userId } = req.body; // รับ userId จาก frontend

  if (!userId) {
    return res
      .status(400)
      .json({ message: "UserId is required for checkout." });
  }

  try {
    const pool = await poolPromise;

    // สร้างคำสั่งซื้อใหม่ในตาราง Orders
    const orderResult = await pool
      .request()
      .input("UserId", userId)
      .input("TotalAmount", total)
      .query(
        "INSERT INTO Orders (UserId, TotalAmount, OrderDate) OUTPUT INSERTED.OrderId VALUES (@UserId, @TotalAmount, GETDATE())"
      );

    const orderId = orderResult.recordset[0].OrderId;

    // เพิ่มสินค้าในตาราง OrderItems
    for (const item of items) {
      await pool
        .request()
        .input("OrderId", orderId)
        .input("ProductId", item.ProductId)
        .input("Quantity", item.Quantity)
        .input("Price", item.Price)
        .query(
          "INSERT INTO OrderItems (OrderId, ProductId, Quantity, Price) VALUES (@OrderId, @ProductId, @Quantity, @Price)"
        );

      // อัปเดตสต็อกสินค้า
      await pool
        .request()
        .input("ProductId", item.ProductId)
        .input("Quantity", item.Quantity)
        .query(
          "UPDATE Products SET Stock = Stock - @Quantity WHERE ProductId = @ProductId"
        );
    }

    // ลบเฉพาะรายการที่ถูก checkout ออกจากตะกร้า
    for (const item of items) {
      await pool
        .request()
        .input("UserId", userId)
        .input("ProductId", item.ProductId)
        .query(
          "DELETE FROM Cart WHERE UserId = @UserId AND ProductId = @ProductId"
        );
    }

    res.status(200).json({ message: "Checkout successful" });
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).json({ message: "Error during checkout", error });
  }
};

// ฟังก์ชันตรวจสอบ stock
exports.checkStock = async (req, res) => {
  const productId = req.params.productId;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("ProductId", productId)
      .query(`SELECT Stock FROM Products WHERE ProductId = @ProductId`);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
