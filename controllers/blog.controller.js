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
  getBlog: asyncHandler(async (req, res, next) => {
    try {
      const slug = req.params.slug;
      const blog = await Blog.findOne({
        where: { slug },
        attributes: { exclude: ["id", "updatedAt"] },
        include: [
          {
            model: BlogDetail, // Assuming your related model is BlogPost
            attributes: { exclude: ["id", "blog_id", "updatedAt"] },
          },
        ],
      });

      if (!blog) {
        return res.status(404).json({ msg: "Blog not found" });
      }

      res.status(200).json({
        msg: "Get Blog Detail successfully",
        data: blog,
      });
    } catch (error) {
      throw error;
    }
  }),
  getBlogDetail: asyncHandler(async (req, res, next) => {
    try {
      const slug = req.params.slug;
      const blogDetail = await BlogDetail.findOne({
        where: { slug: slug },
        attributes: {
          exclude: ["blog_id", "id"],
        },
        include: [
          {
            model: Blog,
            attributes: { exclude: ["id"] },
          },
        ],
      });
      const blog = await Blog.findOne({
        where: {
          slug: blogDetail.Blog.slug,
        },
      });
      const relatedBlogs = await blog.getBlogDetails({
        where: {
          slug: { [Op.ne]: blogDetail.slug }, // Exclude the current blog detail by slug
          // Add other conditions for related blogs, if needed
        },
        limit: 6,
        attributes: { exclude: ["blog_id"] },
        include: [
          {
            model: Blog, // Include the Blog model
            attributes: { exclude: ["id"] }, // Optionally exclude attributes from the Blog model
          },
        ],
      });

      if (!blogDetail) {
        return res.status(404).json({ msg: "Blog not found" });
      }
      res.status(200).json({
        msg: "Get Blog Detail successfully",
        data: blogDetail,
        relateBlogs: relatedBlogs,
      });
    } catch (error) {
      throw error;
    }
  }),
  getLastestBlog: asyncHandler(async (req, res, next) => {
    try {
      const latestBlogs = await BlogDetail.findAll({
        attributes: {
          exclude: ["id", "blog_id", "content"],
        },
        include: [
          {
            model: Blog,
            attributes: ["title", "slug"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 4,
      });
      res.status(200).json({
        msg: "Get Blog Detail successfully",
        data: latestBlogs,
      });
    } catch (error) {
      throw error;
    }
  }),
  bulkCreateBlog: asyncHandler(async (req, res, next) => {
    const blogs = req.body.data;
    await Blog.bulkCreate(blogs);
    return res.status(201).json({
      msg: "Thêm blogs thành công",
    });
  }),
  bulkCreateBlogDetail: asyncHandler(async (req, res, next) => {
    const blogs = req.body.data;
    await BlogDetail.bulkCreate(blogs);
    return res.status(201).json({
      msg: "Thêm blogs thành công",
    });
  }),
};
