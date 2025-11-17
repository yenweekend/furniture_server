const { DataTypes, ENUM } = require("sequelize");
const { sequelize } = require("../configs/postgreConn");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const shortid = require("shortid");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: shortid.generate,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true, // Đảm bảo email là duy nhất
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("user", "admin", "manager"),
      defaultValue: "user",
    },
    refreshToken: {
      type: DataTypes.STRING,
    },
    passwordChangeAt: {
      type: DataTypes.STRING,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
    },
    passwordResetExpired: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "users", // Tên bảng trong cơ sở dữ liệu
    timestamps: true, // Thêm các trường createdAt và updatedAt
  }
);
User.prototype.isCorrectPassword = async function (password) {
  return await bcrypt.compare(password.trim(), this.password);
};
User.prototype.createTokenPasswordAlter = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  // hash the resetToken
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpired = Date.now() + 15 * 60 * 1000; // Expires in 15 minutes
  //return resetToken which has not been hashed
  return resetToken;
};
User.beforeSave(async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password.trim(), 10);
  }
});
module.exports = User;
