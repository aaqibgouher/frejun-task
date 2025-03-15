const express = require("express");
const router = express.Router();

// controllers
const ticketController = require("../controller/ticketController");

// get all trains
router.post("/book", ticketController.bookTickets);
router.get("/booked", ticketController.getBookedTickets);
router.get("/available", ticketController.getAvailableTickets);
router.delete("/cancel/:pnr", ticketController.cancelTicket);

// export
module.exports = router;
