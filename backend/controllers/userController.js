const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { poolPromise } = require("../db");

// Backend code (Node.js)
exports.getUser = async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserId", userId)
      .query("SELECT * FROM Users WHERE UserId = @UserId");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ฟังก์ชันการลงทะเบียน
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // ตรวจสอบว่ามีการส่งข้อมูลครบหรือไม่
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const pool = await poolPromise;

    // ตรวจสอบว่าอีเมลมีอยู่ในระบบแล้วหรือไม่
    const existingUser = await pool
      .request()
      .input("Email", email)
      .query("SELECT * FROM Users WHERE Email = @Email");

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // สร้างบัญชีผู้ใช้ใหม่
    await pool
      .request()
      .input("Name", name)
      .input("Email", email)
      .input("Password", hashedPassword)
      .input("Role", "User") // ค่าเริ่มต้นคือ 'User'
      .query(
        `INSERT INTO Users (Name, Email, Password, Role) VALUES (@Name, @Email, @Password, @Role)`
      );

    // ส่งข้อมูลกลับไปยัง frontend
    res.status(201).json({
      message: "User registered successfully",
      user: { email, role: "User" },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ฟังก์ชันการล็อกอิน
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("Email", email)
      .query(`SELECT * FROM Users WHERE Email = @Email`);

    // ตรวจสอบว่าพบผู้ใช้งานหรือไม่
    if (result.recordset.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.Password);

    // ตรวจสอบรหัสผ่าน
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // สร้าง token
    const jwtSecret =
      process.env.JWT_SECRET ||
      "e1a8260159f48b183d290c5c33f010c9ba01190f9adda8fc6e98049fe2f06519626309bd4af3d56ec17386f4577c2e3725450e4fdf4548cffd9e25eb7da8908a";
    const token = jwt.sign({ id: user.UserId, role: user.Role }, jwtSecret, {
      expiresIn: "1h",
    });

    // ส่ง token และข้อมูลผู้ใช้กลับไปยัง frontend
    res.json({
      token,
      user: {
        id: user.UserId,
        name: user.Name,
        email: user.Email,
        role: user.Role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ฟังก์ชันการตรวจสอบผู้ใช้ปัจจุบัน
exports.getCurrentUser = (req, res) => {
  const token = req.header("Authorization");

  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const jwtSecret =
      process.env.JWT_SECRET ||
      "e1a8260159f48b183d290c5c33f010c9ba01190f9adda8fc6e98049fe2f06519626309bd4af3d56ec17386f4577c2e3725450e4fdf4548cffd9e25eb7da8908a";
    const decoded = jwt.verify(token.split(" ")[1], jwtSecret); // ตรวจสอบ token ที่มากับ Bearer
    res.json(decoded);
  } catch (err) {
    res.status(400).json({ message: "Token is not valid" });
  }
};
