// index.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
require('dotenv').config()
const app = express();
const port = process.env.port || 3001;

app.use(bodyParser.json());
app.use(cors());
const db = mysql.createConnection({
  host: 'bmbdzhtqwcchmqchwzxm-mysql.services.clever-cloud.com',
  user: 'u5stfz1zutlqrxrl',
  password: '2OVzQnP3Ovxz0PWjB989',
  database: 'bmbdzhtqwcchmqchwzxm'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.post('/submitForm', (req, res) => {
  const { name, id, department, dob, gender, designation, salary } = req.body;

  db.query("SELECT * FROM employees WHERE id=?", [id], (err, result) => {
    if (err) {
      console.log("Error checking for existing employee:", err);
      res.status(500).json({ message: 'Error submitting form' });
    } else {
      if (result.length > 0) {
        res.status(200).json({ message: 'Employee with this id already exists' });
      } else {
        const sql = 'INSERT INTO employees (name, id, department, dob, gender, designation, salary) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(sql, [name, id, department, dob, gender, designation, salary], (err, result) => {
          if (err) {
            console.error('Error inserting data into MySQL:', err);
            res.status(500).json({ message: 'Error submitting form' });
          } else {
            console.log('Form submitted successfully');
            res.status(200).json({ message: 'Form submitted successfully' });
          }
        });
      }
    }
  });
});

app.get('/employees', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.query("SELECT * FROM employees LIMIT ? OFFSET ?", [limit, offset], (err, result) => {
    if (err) {
      console.error('Error fetching employees:', err);
      res.status(500).json({ message: 'Error fetching employees' });
    } else {
      db.query("SELECT COUNT(*) AS total FROM employees", (err, countResult) => {
        if (err) {
          console.error('Error fetching total count of employees:', err);
          res.status(500).json({ message: 'Error fetching employees' });
        } else {
          const total = countResult[0].total;
          const totalPages = Math.ceil(total / limit);
          res.status(200).json({ employees: result, totalPages });
        }
      });
    }
  });
});

app.post("/deletedata", (req, res) => {
  const id = req.body.id
  db.query("delete from employees where id=?", [id], (err, result) => {
    if (err) {
      console.error('Error deleting employees:', err);
      res.status(500).json({ message: 'Error' });
    } else {
      res.json({ message: "employee deleted" })
    }
  })
})

app.get('/search', (req, res) => {
  const keyword = req.query.keyword;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const sql = `SELECT * FROM employees WHERE BINARY name LIKE '%${keyword}%' OR BINARY id LIKE '%${keyword}%' OR BINARY department LIKE '%${keyword}%' OR BINARY dob LIKE '%${keyword}%' OR BINARY gender LIKE '%${keyword}%' OR BINARY designation LIKE '%${keyword}%' OR BINARY salary LIKE '%${keyword}%' LIMIT ?, ?`;
  db.query(sql, [offset, limit], (err, result) => {
    if (err) {
      console.error('Error searching employees:', err);
      res.status(500).json({ message: 'Error searching employees' });
    } else {
      db.query(`SELECT COUNT(*) AS total FROM employees WHERE BINARY name LIKE '%${keyword}%' OR BINARY id LIKE '%${keyword}%' OR BINARY department LIKE '%${keyword}%' OR BINARY dob LIKE '%${keyword}%' OR BINARY gender LIKE '%${keyword}%' OR BINARY designation LIKE '%${keyword}%' OR BINARY salary LIKE '%${keyword}%'`, (err, countResult) => {
        if (err) {
          console.error('Error fetching total count of employees:', err);
          res.status(500).json({ message: 'Error fetching employees' });
        } else {
          const total = countResult[0].total;
          const totalPages = Math.ceil(total / limit);
          res.status(200).json({ results: result, totalPages });
        }
      });
    }
  });
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
