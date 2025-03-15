const express = require("express");
const router = express.Router();

// controllers
const berthController = require("../controller/berthController");

// get all trains
router.get("/", berthController.getBerths);

// export
module.exports = router;
