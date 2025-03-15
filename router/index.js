const express = require("express");
const router = express.Router();

// routes
const configRoutes = require("./configRoutes");
const berthRoutes = require("./berthRoutes");
const ticketRoutes = require("./ticketRoutes");

// use
router.use("/configs", configRoutes);
router.use("/berths", berthRoutes);
router.use("/tickets", ticketRoutes);

module.exports = router;
