const sql = require('mssql');

const config = {
  user: 'sa',        // แทนที่ด้วยชื่อผู้ใช้ฐานข้อมูลของคุณ
  password: 'Dbfored1',  // แทนที่ด้วยรหัสผ่านฐานข้อมูลของคุณ
  server: 'NOOBMASTER',          // ชื่อเซิร์ฟเวอร์
  port: 1433,                    // พอร์ต SQL Server
  database: 'BP',       // ชื่อฐานข้อมูล
  options: {
    encrypt: true,                // เปิดใช้งานการเข้ารหัส
    trustServerCertificate: true  // อนุญาตการใช้ self-signed certificate
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch(err => console.log('Database Connection Failed', err));

module.exports = { sql, poolPromise };
