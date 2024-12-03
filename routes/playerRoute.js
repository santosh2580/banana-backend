const express = require("express");
const securityController = require("./../controllers/securityController");

const router = express.Router();

router.post("/register", securityController.register);
router.post("/log-in", securityController.authenticate);

module.exports = router;
