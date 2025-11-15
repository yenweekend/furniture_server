const { Op } = require("sequelize");
const { Address, User } = require("../models/association");
const asyncHandler = require("express-async-handler");
const throwError = require("../helpers/throwError");
module.exports = {
  create: asyncHandler(async (req, res) => {
    const { address_code, address_detail, full_name, phone_number, address } =
      req.body;
    const userId = req;
    // const userId = "WBo50izPh";
    const user = await User.findByPk(userId);
    if (!user) {
      throwError("Không tìm thấy tài khoản người dùng", 404);
    }
    await user.createAddress({
      address_code,
      address_detail,
      full_name,
      phone_number,
      address,
    });
    return res.status(201).json({
      msg: "Thêm địa chỉ mới thành công !",
    });
  }),
  get: asyncHandler(async (req, res) => {
    const userId = req;
    // const userId = "WBo50izPh";
    const user = await User.findByPk(userId);
    if (!user) {
      throwError("Không tìm thấy tài khoản người dùng", 404);
    }
    const addresses = await user.getAddresses();
    return res.status(200).json({
      msg: "Lấy địa chỉ người dùng thành công !",
      data: addresses,
    });
  }),
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedCount = await Address.destroy({
      where: {
        id: id,
      },
    });
    if (deletedCount > 0) {
      return res.status(200).json({
        msg: "Xóa địa chỉ thành công !",
      });
    } else {
      return res.status(404).json({
        msg: "Địa chỉ không tồn tại",
      });
    }
  }),
  update: asyncHandler(async (req, res) => {
    const updateData = req.body;
    const { id } = req.params;
    const userId = req;
    // const userId = "WBo50izPh";
    const user = await User.findByPk(userId);
    if (!user) {
      throwError("Không tìm thấy tài khoản người dùng", 404);
    }
    const address = await Address.findByPk(id);
    const belongFlag = await user.hasAddress(address);
    if (!belongFlag) {
      throwError("Bạn không thể thay đổi địa chỉ của người khác", 400);
    }

    //    const address = await user.getAddresses()
    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ msg: "Không có dữ liệu cho update địa chỉ" });
    }
    await address.update(updateData);
    res.json({ msg: "Cập nhật địa chỉ thành công", address });
  }),
};
