const express = require("express");
require("dotenv").config();
const router = require("./router");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/v1", router);

app.listen(PORT, () => console.log(`Server running at ${PORT}`));
