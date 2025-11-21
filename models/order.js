const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/postgreConn");
const { slugify } = require("../helpers/slugify");
const shortid = require("shortid");
const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: shortid.generate,
    },
    status: {
      type: DataTypes.ENUM("pending", "success", "refuse"),
      defaultValue: "pending",
    },
    pay_method: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
    },
    address_detail: {
      type: DataTypes.TEXT,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
    },
    original_total_price: {
      type: DataTypes.DECIMAL(10, 2),
    },
    discount_type: {
      type: DataTypes.ENUM("percent", "fixed"),
    },
    discount_value: {
      type: DataTypes.BIGINT,
    },
    coupon_name: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "order",
    timestamps: true,
  }
);

module.exports = Order;
