const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");
const shortid = require("shortid");

const BlogDetailTag = sequelize.define(
  "BlogDetailTag",
  {
    blog_detail_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "blog_detail",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    tag_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "tag",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "blog_detail_tag",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["blog_detail_id", "tag_id"],
      },
    ],
  }
);

module.exports = BlogDetailTag;
