const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");
const ProductGift = sequelize.define(
  "ProductGift",
  {
    product_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "product",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    gift_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "gift",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "product_gift",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["product_id", "gift_id"],
      },
    ],
  }
);

module.exports = ProductGift;
