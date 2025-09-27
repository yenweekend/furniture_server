const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");
const shortid = require("shortid");

const ReviewImage = sequelize.define(
  "ReviewImage",
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: shortid.generate,
      primaryKey: true,
    },
    review_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "review",
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
    tableName: "review_image",
    timestamps: true,
  }
);
module.exports = ReviewImage;
