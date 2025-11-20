const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");
const { slugify } = require("../../helpers/slugify");
const shortid = require("shortid");
const BlogDetail = sequelize.define(
  "BlogDetail",
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
    blog_id: {
      type: DataTypes.STRING,
      references: {
        model: "blog",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    thumbnail: {
      type: DataTypes.STRING,
    },
    content: {
      type: DataTypes.TEXT,
    },
    slug: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "blog_detail",
    timestamps: true,
  }
);
BlogDetail.beforeBulkCreate((instances, options) => {
  for (let ins of instances) {
    const slugName = slugify(ins.title);
    ins.slug = slugName;
  }
});

BlogDetail.beforeCreate(async (blogDetail, options) => {
  const slugName = slugify(blogDetail.title);
  blogDetail.slug = slugName;
});
module.exports = BlogDetail;
