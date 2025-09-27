const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");

const ProductCollection = sequelize.define(
  "ProductCollection",
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
    collection_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: "collection",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "product_collection",
    timestamps: true,
  }
);

module.exports = ProductCollection;
