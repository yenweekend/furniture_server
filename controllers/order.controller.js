const {
  Order,
  OrderDetail,
  User,
  Product,
  Coupon,
  Address,
} = require("../models/association");
const asyncHandler = require("express-async-handler");
const { hexists, hdel } = require("../services/redis.service");
const { sequelize } = require("../configs/postgreConn");
const throwError = require("../helpers/throwError");
const { Op, where } = require("sequelize");
const isCouponExpired = require("../helpers/isCouponExpired");
const { query } = require("express");
module.exports = {
  create: asyncHandler(async (req, res) => {
    const {
      address,
      items,
      total_price,
      address_detail,
      discount_value,
      original_total_price,
      coupon_name,
      discount_type,
      pay_method,
    } = req.body;
    const { userId } = req;

    const transaction = await sequelize.transaction();
    try {
      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        throwError("Không tìm thấy tài khoản người dùng", 404);
      }
      const newOrder = await user.createOrder(
        {
          address_detail,
          address: address,
          total_price: total_price,
          discount_value,
          original_total_price,
          coupon_name,
          discount_type,
          pay_method,
        },
        { transaction }
      );
      await Promise.all(
        items.map(async (item) => {
          const product = await Product.findByPk(item.id, { transaction });

          if (!product) {
            await transaction.rollback();
            throw new Error(`Product with ID ${item.id} does not exist.`);
          }
          await newOrder.addProduct(product, {
            through: {
              quantity: item.quantity,
              price: product.price || product.price_original,
              price_original: product.price_original,
            },
            transaction,
          });
          await hdel(`cart:${userId}`, `product:${item.id}`);
        })
      );
      const coupon = await Coupon.findOne({
        where: {
          code: coupon_name,
        },
      });
      if (coupon) {
        await user.addCoupon(coupon);
      }
      await transaction.commit();
      return res.status(201).json({
        msg: "Đã tạo đơn hàng thành công",
        productPurchasedId: items.map((item) => item.id),
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }),
  updateStatus: asyncHandler(async (req, res) => {
    const { status, orderId } = req.body.data;
    await Order.update(
      {
        status: status,
      },
      { where: { id: orderId } }
    );
    return res.status(201).json({
      msg: "Đã cập nhật trạng thái đơn hàng",
    });
  }),
  get: asyncHandler(async (req, res) => {
    const { userId } = req;
    const user = await User.findByPk(userId);
    if (!user) {
      throwError("Không tìm thấy người dùng", 404);
    }

    const orderDetail = await user.getOrders({
      include: [
        {
          model: OrderDetail,
          include: {
            model: Product,
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      msg: "Lấy dữ liệu đơn mua thành công",
      data: orderDetail,
    });
  }),
  getPurchaseUserInfo: asyncHandler(async (req, res) => {
    const userId = req.userId;
    // const userId = "WBo50izPh";
    const user = await User.findOne({
      where: {
        id: userId,
      },
      attributes: { exclude: ["refreshToken", "password", "role"] },
    });
    const addresses = await user.getAddresses();
    return res.status(200).json({
      userInfo: user,
      addresses,
    });
  }),
  applyCoupon: asyncHandler(async (req, res) => {
    const userId = req.userId;
    // const userId = "WBo50izPh";
    const user = await User.findOne({
      where: {
        id: userId,
      },
      attributes: { exclude: ["refreshToken", "password", "role"] },
    });
    const { code, total } = req.query;
    console.log(req.query);
    const coupon = await Coupon.findOne({
      where: {
        code: code,
        condition: {
          [Op.lte]: parseInt(total),
        },
      },
    });
    if (!coupon) {
      return res.status(404).json({
        msg: "Mã đã hết hạn hoặc bạn không đạt đủ điều kiện của voucher  ",
      });
    }
    const isExpired = isCouponExpired(coupon.expire_date);
    if ((await user.hasCoupon(coupon)) || isExpired) {
      return res.status(400).json({
        msg: "Mã không còn khả dụng",
      });
    }
    return res.status(200).json({
      coupon: coupon,
    });
  }),
};
