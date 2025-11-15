const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/postgreConn");
const shortid = require("shortid");
const Address = sequelize.define(
  "Address",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: shortid.generate,
    },
    address_code: {
      type: DataTypes.STRING, // 01-004-007
    },
    address: {
      type: DataTypes.TEXT,
    },
    address_detail: {
      type: DataTypes.TEXT,
    },
    full_name: {
      type: DataTypes.STRING,
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
    on_used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    phone_number: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "address",
    timestamps: true,
  }
);

module.exports = Address;
