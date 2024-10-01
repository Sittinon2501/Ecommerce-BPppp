const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken"); // นำเข้าโมดูล jsonwebtoken
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cart"); // นำเข้าตารางเส้นทางสำหรับ Cart
const addAdmin = require("./routes/admin"); // นำเข้าเส้นทางสำหรับ Admin
const chartRoutes = require("./routes/chart");
const reportRoutes = require("./routes/reportRoutes");
const path = require("path");
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Middleware เพื่อเพิ่ม userId ลงใน request object
app.use((req, res, next) => {
  const token = req.header("Authorization");
  if (token) {
    try {
      const jwtSecret =
        process.env.JWT_SECRET ||
        "e1a8260159f48b183d290c5c33f010c9ba01190f9adda8fc6e98049fe2f06519626309bd4af3d56ec17386f4577c2e3725450e4fdf4548cffd9e25eb7da8908a";
      const decoded = jwt.verify(token.split(" ")[1], jwtSecret); // ใช้ jwt.verify เพื่อตรวจสอบ token
      req.userId = decoded.id; // เพิ่ม userId ลงใน request
      console.log("Decoded token:", decoded); // ตรวจสอบค่าที่ถอดรหัสได้
    } catch (err) {
      console.error("JWT verification error:", err);
      return res.status(400).json({ message: "Token is not valid" });
    }
  }
  next();
});

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes); // เพิ่ม /api/cart เพื่อให้สอดคล้องกับ API อื่น ๆ
app.use("/api/admin", addAdmin); // เพิ่มเส้นทางสำหรับ Admin
app.use("/api/charts", chartRoutes);
app.use("/api/reports", reportRoutes); // เพิ่ม route สำหรับ reports
// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
