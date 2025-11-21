const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/postgreConn");
const shortid = require("shortid");
const OrderDetail = sequelize.define(
  "OrderDetail",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: shortid.generate,
    },
    order_id: {
      type: DataTypes.STRING,
      references: {
        model: "order",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    product_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: "product",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    quantity: {
      type: DataTypes.BIGINT,
    },
    price_original: {
      type: DataTypes.DECIMAL(10, 2),
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
    },
  },
  {
    tableName: "order_detail",
    timestamps: true,
  }
);

module.exports = OrderDetail;
