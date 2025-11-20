const express = require("express");
const router = express.Router();
const AddressController = require("../controllers/address.controller");

router.post("/create", AddressController.create);
router.patch("/update/:id", AddressController.update);
router.get("/get", AddressController.get);
router.delete("/delete/:id", AddressController.delete);
module.exports = router;
