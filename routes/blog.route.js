const express = require("express");
const router = express.Router();
const BlogController = require("../controllers/blog.controller");
router.post("/create", BlogController.createBLog);
router.post("/blog-detail/create", BlogController.createBlogDetail);
router.post("/bulk-create", BlogController.bulkCreateBlog);
router.post("/blog-detail/bulk-create", BlogController.bulkCreateBlogDetail);
router.get("/get/:slug", BlogController.getBlog);
router.get("/detail/get/:slug", BlogController.getBlogDetail);
router.get("/latest-blogs", BlogController.getLastestBlog);

module.exports = router;
