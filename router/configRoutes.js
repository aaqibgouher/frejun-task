const express = require("express");
const router = express.Router();

// controllers
const configController = require("../controller/configController");

// get all trains
router.get("/", configController.getConfigs);
router.post("/", configController.addConfig);

// export
module.exports = router;
