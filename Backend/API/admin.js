import { Router } from "express";
const router = Router();
import { v4 as uuidv4 } from 'uuid';
import { query } from "../Database/connection";



// ------------ Table Routes ----------------
const createTable = (callback) => {
    console.log('createTable Called');
    const gameId = uuidv4();
    console.log('Game created:', gameId);
    const insertSql = 'INSERT INTO games (id, status) VALUES (?, ?)';
    query(insertSql, [gameId, 'active'], (error, results) => {
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
    query(statement, (error, data) => {
        if(error) return response.send(error);
        return response.status(200).json(data);
    })
})

// GET table:id
router.get("/table/:tableID", (request, response) => {
    const statement = `SELECT * FROM TABLES WHERE id = '${request.params.tableID}'`
    query(statement, (error, data) => {
        if(error) return response.send(error);
        return response.status(200).json(data);
    })
})

// -------------------------------------------------------

export default router;