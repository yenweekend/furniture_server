const productRouter = require("./product.route");

const express = require("express");
const router = express.Router();

router.use("/products", productRouter); // Route cho products
