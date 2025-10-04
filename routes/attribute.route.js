const express = require("express");
const router = express.Router();
const AttributeController = require("../controllers/attribute.controller");
router.post("/create", AttributeController.createAttribute);
router.post("/create-mutiple", AttributeController.createBulkAttribute);
router.post("/attribute-value/create", AttributeController.addAttributeValue);

module.exports = router;
