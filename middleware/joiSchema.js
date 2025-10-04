const Joi = require("joi");
const { password } = require("pg/lib/defaults");
const signupSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{8,30}$")) // Mật khẩu phải có từ 8 đến 30 ký tự, chỉ bao gồm chữ và số
    .required(),
});
module.exports = { signupSchema };
