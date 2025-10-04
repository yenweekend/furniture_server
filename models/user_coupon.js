const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/postgreConn");
const { slugify } = require("../helpers/slugify");
const shortid = require("shortid");
const UserCoupon = sequelize.define(
  "UserCoupon",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: shortid.generate,
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
    coupon_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: "coupon",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "user_coupon",
    timestamps: true,
  }
);

module.exports = UserCoupon;
