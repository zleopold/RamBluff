// -------- Server Packages ------------

const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');

//---------------------------------------

// API Routes
const {utilRoutes, adminRoutes} = require("./API/routes");

const app = express();
const port = 3001;

// req response format
app.use(bodyParser.json());

// Permissions
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from http://localhost:3000
}));

// API Routes
app.use("/admin",adminRoutes);
app.use("/util",utilRoutes);



const server = http.createServer(app);



server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
