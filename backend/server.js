const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Connected to the SQLite database");
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        gender TEXT,
        dob TEXT,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS alarms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userEmail TEXT,
        time TEXT,
        date TEXT,
        label TEXT,
        isActive INTEGER
    )`);
});

app.post('/register', (req, res) => {
    const { name, email, gender, dob, password } = req.body;
    db.run(`INSERT INTO users (name, email, gender, dob, password) VALUES (?, ?, ?, ?, ?)`,
        [name, email, gender, dob, password],
        function(err) {
            if (err) {
                console.error("Registration error:", err.message);
                return res.status(400).json({ error: "User already exists" });
            }
            console.log("User registered successfully:", email);
            res.json({ id: this.lastID, name, email, gender, dob });
        }
    );
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ? AND password = ?`, [email, password], (err, row) => {
        if (err || !row) {
            console.log("Login failed for:", email);
            return res.status(401).json({ error: "Invalid credentials" });
        }
        console.log("User logged in successfully:", email);
        res.json({ id: row.id, name: row.name, email: row.email, gender: row.gender, dob: row.dob });
    });
});

app.get('/alarms/:email', (req, res) => {
    db.all(`SELECT * FROM alarms WHERE userEmail = ?`, [req.params.email], (err, rows) => {
        if (err) {
            console.error("Error fetching alarms:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post('/alarms', (req, res) => {
    const { userEmail, time, date, label, isActive } = req.body;
    db.run(`INSERT INTO alarms (userEmail, time, date, label, isActive) VALUES (?, ?, ?, ?, ?)`,
        [userEmail, time, date, label, isActive ? 1 : 0],
        function(err) {
            if (err) {
                console.error("Error adding alarm:", err.message);
                return res.status(500).json({ error: err.message });
            }
            console.log("Alarm added successfully for:", userEmail);
            res.json({ id: this.lastID, userEmail, time, date, label, isActive });
        }
    );
});

app.put('/alarms/:id', (req, res) => {
    const { isActive } = req.body;
    db.run(`UPDATE alarms SET isActive = ? WHERE id = ?`, [isActive ? 1 : 0, req.params.id], function(err) {
        if (err) {
            console.error("Error updating alarm:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log("Alarm status toggled");
        res.json({ updated: this.changes });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});