const asyncHandler = require("express-async-handler");
const {
  Blog,
  BlogDetail,
  BlogDetailTag,
  Tag,
} = require("../models/association");
const { Op, where } = require("sequelize");
module.exports = {
  createBLog: asyncHandler(async (req, res, next) => {
    try {
      const title = req.body.title;
      await Blog.create({ title: title });
      res.status(201).json({
        msg: "BLog added successfully",
      });
    } catch (error) {
      throw error;
    }
  }),
  createBlogDetail: asyncHandler(async (req, res, next) => {
    try {
      const blog = await Blog.findOne({
        where: { slug: "tin-tuc" },
      });

      if (!blog) {
        return res.status(404).json({ msg: "Blog not found" });
      }

      const { content, thumbnail, title } = req.body.data;

      const rs = await blog.createBlogDetail({ content, thumbnail, title });

      res.status(201).json({
        msg: "BlogDetail added successfully",
        rs,
      });
    } catch (error) {
      throw error;
    }
  }),
};
