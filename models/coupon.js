const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/postgreConn");
const { slugify } = require("../helpers/slugify");
const shortid = require("shortid");
const Coupon = sequelize.define(
  "Coupon",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: shortid.generate,
    },
    title: {
      type: DataTypes.STRING,
    },
    condition: {
      type: DataTypes.BIGINT,
    },
    expire_date: {
      type: DataTypes.DATE,
    },
    discount_type: {
      type: DataTypes.ENUM("percent", "fixed"),
      defaultValue: "fixed",
    },
    discount_value: {
      type: DataTypes.BIGINT,
    },
    code: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "coupon",
    timestamps: true,
  }
);

module.exports = Coupon;
