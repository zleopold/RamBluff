const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require("../Database/connection");


// ------------ Table Routes ----------------
const createTable = (callback) => {
    const gameId = uuidv4();
    console.log('Game created:', gameId);
    const insertSql = 'INSERT INTO games (id, status) VALUES (?, ?)';
    db.query(insertSql, [gameId, 'active'], (error, results) => {
        if (error) {
            return callback({ error: 'Failed to create table' });
        }

        callback(null, { gameId });
    });
};

router.post('/createTable', (req, res) => {
    createTable((error, result) => {
        if (error) {
            return res.status(500).json(error)
        }
        res.status(200).json(result);
    });
});


// GET tables
router.get("/tables", (request, response) => {
    const statement = `SELECT * FROM TABLES;`;
    db.query(statement, (error, data) => {
        if(error) return response.send(error);
        return response.status(200).json(data);
    })
})

// GET table:id
router.get("/table/:tableID", (request, response) => {
    const statement = `SELECT * FROM TABLES WHERE id = '${request.params.tableID}'`
    db.query(statement, (error, data) => {
        if(error) return response.send(error);
        return response.status(200).json(data);
    })
})

// -------------------------------------------------------

module.exports = router;