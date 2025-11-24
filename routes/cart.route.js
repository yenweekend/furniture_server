const express = require("express");
const {
  add,
  deleteItem,
  get,
  update,
} = require("../controllers/cart.controller");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();

router.post("/add", [verifyToken], add);
router.patch("/update/:productId", [verifyToken], update);

router.get("/cart", [verifyToken], get);

router.delete("/delete/:id", [verifyToken], deleteItem);

module.exports = router;
