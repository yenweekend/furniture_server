const productRouter = require("./product.route");
const HomeController = require("../controllers/home.controller");
const auth = require("./auth.route");

const express = require("express");
const router = express.Router();

router.use("/v1/auth", auth); // Route cho auth
router.use("/products", productRouter); // Route cho products
router.get("/home/get", HomeController.getContent);

module.exports = router;
