const { Op } = require("sequelize");
const { Coupon } = require("../models/association");
const asyncHandler = require("express-async-handler");
module.exports = {
  create: asyncHandler(async (req, res) => {
    const data = req.body.data;
    await Coupon.create(data);
    return res.status(201).json({
      msg: "Tạo mới voucher thành công !",
    });
  }),
  get: asyncHandler(async (req, res) => {
    const vouchers = await Coupon.findAll({
      where: {
        expire_date: {
          [Op.gte]: new Date(), // Get coupons where expire_date is greater than or equal to the current date
        },
      },
    });

    return res.status(200).json({
      msg: "Lấy dữ liệu voucher thành công !",
      data: vouchers,
    });
  }),
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedCount = await Coupon.destroy({
      where: {
        id: id,
      },
    });
    if (deletedCount > 0) {
      return res.status(200).json({
        msg: "Xóa voucher thành công !",
      });
    } else {
      return res.status(404).json({
        msg: "Voucher không tồn tại",
      });
    }
  }),
};
