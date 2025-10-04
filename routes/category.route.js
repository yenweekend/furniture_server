const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/category.controller");

router.get(
  "/category-detail/:slug",
  CategoryController.getPaginatedCategoryProducts
);
router.post("/bulk-create", CategoryController.bulkCreate);
router.post("/assign", CategoryController.create);
module.exports = router;
