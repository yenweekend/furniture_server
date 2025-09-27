const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");

const CategorySubCategory = sequelize.define(
  "CategorySubcategory",
  {
    category_id: {
      type: DataTypes.STRING,
      references: {
        model: "category",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    sub_category_id: {
      type: DataTypes.STRING,
      references: {
        model: "category",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "category_subcategory",
    timestamps: true,
  }
);

module.exports = CategorySubCategory;
