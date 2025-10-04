const express = require("express");
const router = express.Router();
const VendorController = require("../controllers/vendor.controller");
router.post("/create", VendorController.createVendor);

module.exports = router;
