const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");

const ProductCategory = sequelize.define(
  "ProductCategory",
  {
    product_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: "product",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    category_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: "category",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "product_category",
    timestamps: true,
  }
);

module.exports = ProductCategory;
