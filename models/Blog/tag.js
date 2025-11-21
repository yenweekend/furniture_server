const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");
const { slugify } = require("../../helpers/slugify");
const shortid = require("shortid");
const Tag = sequelize.define(
  "Tag",
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
    tableName: "tag",
    timestamps: true,
  }
);
Tag.beforeBulkCreate((tags, options) => {
  for (let tag of tags) {
    const slugName = slugify(tag.title);
    tag.slug = slugName;
    tag.url = `/blogs/all/tagged/${slugName}`;
  }
});

Tag.beforeCreate(async (tag, options) => {
  const slugName = slugify(tag.title);
  tag.slug = slugName;
  tag.url = `/blogs/all/tagged/${slugName}`;
});
module.exports = Tag;
