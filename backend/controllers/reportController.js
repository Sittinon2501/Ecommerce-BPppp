const { poolPromise } = require("../db"); // นำเข้าการเชื่อมต่อฐานข้อมูล

  exports.getTopSellingProductsReport = async (req, res) => {
    const { startDate, endDate } = req.query;
  
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('StartDate', startDate)
        .input('EndDate', endDate)
        .query(`
          SELECT 
            P.ProductName,
            SUM(OI.Quantity) as TotalSold, 
            SUM(OI.Price * OI.Quantity) as TotalRevenue,
            FORMAT(O.OrderDate, 'yyyy-MM') as Month
          FROM Orders O
          JOIN OrderItems OI ON O.OrderId = OI.OrderId
          JOIN Products P ON OI.ProductId = P.ProductId
          WHERE O.OrderDate >= @StartDate AND O.OrderDate <= @EndDate
          GROUP BY P.ProductName, FORMAT(O.OrderDate, 'yyyy-MM')
          ORDER BY TotalSold DESC
        `);
  
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error("Error generating top-selling products report:", error);
      res.status(500).json({ message: 'Error generating top-selling products report', error });
    }
  };
  exports.getLowSellingProductsReport = async (req, res) => {
    const { startDate, endDate } = req.query;
  
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('StartDate', startDate)
        .input('EndDate', endDate)
        .query(`
          SELECT 
            P.ProductName,
            SUM(OI.Quantity) as TotalSold, 
            SUM(OI.Price * OI.Quantity) as TotalRevenue,
            FORMAT(O.OrderDate, 'yyyy-MM') as Month
          FROM Orders O
          JOIN OrderItems OI ON O.OrderId = OI.OrderId
          JOIN Products P ON OI.ProductId = P.ProductId
          WHERE O.OrderDate >= @StartDate AND O.OrderDate <= @EndDate
          GROUP BY P.ProductName, FORMAT(O.OrderDate, 'yyyy-MM')
          ORDER BY TotalSold ASC
        `);
  
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error("Error generating low-selling products report:", error);
      res.status(500).json({ message: 'Error generating low-selling products report', error });
    }
  };
  exports.getRevenueReport = async (req, res) => {
    const { startDate, endDate } = req.query;
  
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('StartDate', startDate)
        .input('EndDate', endDate)
        .query(`
          SELECT 
            SUM(O.TotalAmount) as TotalRevenue,  -- รายได้ทั้งหมดจากตาราง Orders
            FORMAT(O.OrderDate, 'yyyy-MM') as Month
          FROM Orders O
          WHERE O.OrderDate >= @StartDate AND O.OrderDate <= @EndDate
          GROUP BY FORMAT(O.OrderDate, 'yyyy-MM')
          ORDER BY Month ASC
        `);
  
      res.status(200).json(result.recordset);  // ส่งผลลัพธ์กลับไปให้ frontend
    } catch (error) {
      console.error("Error generating revenue report:", error);
      res.status(500).json({ message: 'Error generating revenue report', error });
    }
  };
  