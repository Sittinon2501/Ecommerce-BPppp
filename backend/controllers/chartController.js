// controllers/chartController.js
const { poolPromise } = require("../db");

// Sales Overview by Month
exports.getSalesOverview = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        FORMAT(OrderDate, 'yyyy-MM') as OrderMonth, 
        SUM(TotalAmount) as TotalSales
      FROM Orders
      GROUP BY FORMAT(OrderDate, 'yyyy-MM')
      ORDER BY FORMAT(OrderDate, 'yyyy-MM')
    `);
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Top-Selling Products
exports.getTopSellingProducts = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 5 Products.ProductName, SUM(OrderItems.Quantity) as TotalSold
      FROM OrderItems
      JOIN Products ON OrderItems.ProductId = Products.ProductId
      GROUP BY Products.ProductName
      ORDER BY TotalSold DESC
    `);
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Revenue by Category
exports.getRevenueByCategory = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT Categories.CategoryName, SUM(Orders.TotalAmount) as TotalRevenue
      FROM Orders
      JOIN OrderItems ON Orders.OrderId = OrderItems.OrderId
      JOIN Products ON OrderItems.ProductId = Products.ProductId
      JOIN Categories ON Products.CategoryId = Categories.CategoryId
      GROUP BY Categories.CategoryName
    `);
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Customer Demographics

exports.getCustomerDemographics = async (req, res) => {
  try {
    const pool = await poolPromise;

    // ใช้ชื่อคอลัมน์ที่ถูกต้องคือ RegistrationDate
    const result = await pool.request().query(`
        SELECT YEAR(RegistrationDate) as RegistrationYear, COUNT(UserId) as TotalCustomers
        FROM Users
        GROUP BY YEAR(RegistrationDate)
      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error in getCustomerDemographics:", error); // เพิ่ม logging เพื่อ debug
    res
      .status(500)
      .json({
        message: "Error retrieving customer demographics",
        error: error.message,
      });
  }
};

// Low-Selling Products
exports.getLowSellingProducts = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 5 Products.ProductName, SUM(OrderItems.Quantity) as TotalSold
      FROM OrderItems
      JOIN Products ON OrderItems.ProductId = Products.ProductId
      GROUP BY Products.ProductName
      ORDER BY TotalSold ASC
    `);
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
