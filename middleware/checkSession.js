const crypto = require("crypto");
const redis = require("../services/redis.service");
const client = require("../databases/init.redis");

module.exports = {
  checkSession: async (req, res, next) => {
    if (!req.session.cartId) {
      const cartId = crypto.randomBytes(16).toString("hex");
      req.session.cartId = cartId; // Assign new cart ID

      req.session.save(); // Ensure session is updated
    }
    next();
  },
};
