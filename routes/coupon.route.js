const express = require("express");
const router = express.Router();
const CouponController = require("../controllers/coupon.controller");
router.post("/create", CouponController.create);
router.delete("/delete/:id", CouponController.delete);
router.get("/get", CouponController.get);

module.exports = router;
