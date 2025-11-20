const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");
const { slugify } = require("../../helpers/slugify");
const shortid = require("shortid");
const Blog = sequelize.define(
  "Blog",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: shortid.generate,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    slug: {
      type: DataTypes.TEXT,
    },

    url: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "blog",
    timestamps: true,
  }
);
Blog.beforeBulkCreate((blogs, options) => {
  for (let blog of blogs) {
    const slugName = slugify(blog.title);
    blog.slug = slugName;
    blog.url = `/blogs/${slugName}`;
  }
});

Blog.beforeCreate(async (blog, options) => {
  const slugName = slugify(blog.title);
  blog.slug = slugName;
  blog.url = `/blogs/${slugName}`;
});
module.exports = Blog;
