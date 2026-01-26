const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

const app = express();
app.use(express.json());

const cors = require("cors");
const allowedOrigins = [
"http://localhost:3000",
// "https://YOUR-frontend.vercel.app", // add later
// "https://YOUR-frontend.onrender.com" // add later
];
app.use(
cors({
origin: function (origin, callback) {
// allow requests with no origin (Postman/server-to-server)
if (!origin) return callback(null, true);
if (allowedOrigins.includes(origin)) {
return callback(null, true);
}
return callback(new Error("Not allowed by CORS"));
},
methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
allowedHeaders: ["Content-Type", "Authorization"],
credentials: false,
})
);

app.get('/', (req, res) => {
    res.send('Nintendo Game Service is running!');
});

app.get('/allgames', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM nintendo_games');
        await connection.end();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error retrieving games' });
    }
});

app.post('/addgame', async (req, res) => {
    const { game_title, description, photo_url } = req.body; 
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO nintendo_games (game_title, description, photo_url) VALUES (?, ?, ?)',
            [game_title, description, photo_url]
        );
        await connection.end();
        res.status(201).json({ message: game_title + ' added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error adding game' });
    }
});

app.put('/updategame/:id', async (req, res) => {
    const { id } = req.params;
    const { game_title, description, photo_url } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE nintendo_games SET game_title = ?, description = ?, photo_url = ? WHERE id = ?',
            [game_title, description, photo_url, id]
        );
        await connection.end();
        res.json({ message: 'Game updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating game' });
    }
});

app.post('/deletegame', async (req, res) => {
    const { id } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM nintendo_games WHERE id = ?', [id]);
        await connection.end();
        res.json({ message: 'Game with ID ' + id + ' deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not delete game' });
    }
});

app.get('/deletegame/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM nintendo_games WHERE id = ?', [id]);
        await connection.end();
        res.json({ message: 'Game with ID ' + id + ' deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not delete game' });
    }
});

app.listen(port, () => console.log(`Server started on port ${port}`));