const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");
const { slugify } = require("../../helpers/slugify");
const shortid = require("shortid");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: shortid.generate,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "category",
    timestamps: true,
  }
);
Category.beforeCreate(async (category, options) => {
  const slugName = slugify(category.title);
  category.url = `/categories/${slugName}`;
  category.slug = slugName;
});
Category.beforeBulkCreate((categories, options) => {
  for (let category of categories) {
    const slugName = slugify(category.title);
    category.slug = slugName;
    category.url = `/categories/${slugName}`;
  }
});
Category.beforeUpdate(async (category, options) => {
  if (category.changed("title")) {
    const slugName = slugify(category.title);
    category.slug = slugName;
    category.url = `/categories/${slugName}`;
  }
});

module.exports = Category;
