const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");
const shortid = require("shortid");

const ProductVariantAttribute = sequelize.define(
  "ProductVariantAttribute",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: shortid.generate,
    },
    product_variant_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "product_variant",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    attr_value_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "attribute_value",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "product_variant_attribute",
    timestamps: true,
  }
);

module.exports = ProductVariantAttribute;
