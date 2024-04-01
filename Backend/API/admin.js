const express = require("express");
const router = express.Router();
const db = require("../Database/connection");

// ------------ Table Routes ----------------

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