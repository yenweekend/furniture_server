const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");
const shortid = require("shortid");

const Image = sequelize.define(
  "Image",
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: shortid.generate,
      primaryKey: true,
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
    img_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "image",
    timestamps: true,
  }
);
module.exports = Image;
