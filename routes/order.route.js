const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/order.controller");

router.post("/create", OrderController.create);
router.patch("/update-status", OrderController.updateStatus);
router.get("/get", OrderController.get);
router.get("/get-coupon", OrderController.applyCoupon);
router.get("/purchaser-info", OrderController.getPurchaseUserInfo);
module.exports = router;
