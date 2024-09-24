const bcrypt = require('bcryptjs');
const { poolPromise } = require('../db');

exports.addAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Name', name)
      .input('Email', email)
      .input('Password', hashedPassword)
      .input('Role', 'Admin')  // กำหนดบทบาทเป็น Admin
      .query(`INSERT INTO Users (Name, Email, Password, Role) VALUES (@Name, @Email, @Password, @Role)`);
    
    res.status(201).json({ message: 'Admin added successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
