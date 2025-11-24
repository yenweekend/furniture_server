const {
  get,
  lrange,
  set,
  hset,
  hgetall,
  hget,
  hincreby,
  hdel,
  expire,
  hexists,
} = require("../services/redis.service");
const throwError = require("../helpers/throwError");
const asyncHandler = require("express-async-handler");
const { Product } = require("../models/association");
const { sequelize } = require("../configs/postgreConn");
const { Op, Sequelize } = require("sequelize");
module.exports = {
  add: asyncHandler(async (req, res) => {
    const { id: productId, payload: payload } = req.body;
    const { userId } = req;
    const existProduct = await hget(`cart:${userId}`, `product:${productId}`);
    if (!existProduct) {
      await hset(`cart:${userId}`, `product:${productId}`, payload);
      // await expire(`cart:${userId}`, 15);
      const sl = await hget(`cart:${userId}`, `product:${productId}`);
      return res.json({
        success: true,
        msg: "Đã thêm sản phẩm vào giỏ hàng",
        soluong: sl,
      });
    }
    await hincreby(`cart:${userId}`, `product:${productId}`, payload);
    const sl = await hget(`cart:${userId}`, `product:${productId}`);
    return res.status(201).json({
      success: true,
      msg: "Đã thêm sản phẩm vào giỏ hàng",
      soluong: sl,
    });
  }),
  get: asyncHandler(async (req, res) => {
    const { userId } = req;
    const existingProducts = await hgetall(`cart:${userId}`);
    if (!existingProducts || Object.keys(existingProducts).length === 0) {
      return res.status(200).json({
        msg: "Chưa có sản phẩm nào trong giỏ hàng",
        products: [],
      });
    }
    const productIds = Object.keys(existingProducts).map((key) =>
      key.replace("product:", "")
    );
    const product = await Product.findAll({
      where: {
        id: {
          [Op.in]: productIds,
        },
      },
      order: [
        [
          Sequelize.literal(
            `array_position(array[${productIds
              .map((id) => `'${id}'`)
              .join(",")}], "Product"."id")`
          ),
          "DESC",
        ],
      ],
    });
    const products = [...product];
    const data = products.map((p) => {
      const product = p.toJSON();

      const {
        id,
        title,
        sku,
        url,
        thumbnail,
        price,
        price_original,
        sale,
        stock,
        single,
      } = product;
      return {
        id,
        title,
        sku,
        url,
        thumbnail,
        price,
        price_original,
        sale,
        stock,
        single,
        quantity: existingProducts[`product:${id}`],
      };
    });
    return res.json({
      success: true,
      msg: "Đã thêm sản phẩm vào giỏ hàng",
      products: data,
    });
  }),
  update: asyncHandler(async (req, res) => {
    const { userId } = req;
    const { productId } = req.params;
    let { quantity } = req.body;
    quantity = parseInt(quantity);
    const exists = await hexists(`cart:${userId}`, `product:${productId}`);

    if (exists === 0) {
      return res.status(404).json({
        msg: "Sản phẩm không tồn tại trong giỏ hàng",
      });
    }
    let quantityInCart = await hget(`cart:${userId}`, `product:${productId}`);
    quantityInCart = parseInt(quantityInCart);
    if (quantity === quantityInCart) {
      return res.json({ msg: "Không có thay đổi trong số lượng" });
    }
    const product = await Product.findOne({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return res.status(404).json({
        msg: "Sản phẩm không tồn tại ",
      });
    }
    const stock = product.stock;
    if (quantity <= 0) {
      return res.status(400).json({
        msg: "Số lượng phải lớn hơn 0",
      });
    }
    const increase = quantity - quantityInCart;
    const newStock = stock - increase;
    if (newStock < 0) {
      return res.status(409).json({
        msg: "Không đủ sản phẩm",
      });
    }
    await sequelize.transaction(async (t) => {
      if (product) {
        await Product.update(
          { stock: newStock },
          { where: { id: productId }, transaction: t }
        );
      }

      // Update quantity in Redis
      await hset(`cart:${userId}`, `product:${productId}`, quantity);
    });
    return res.json({
      msg: "Đã cập nhật số lượng sản phẩm trong giỏ hàng",
    });
  }),
  deleteItem: asyncHandler(async (req, res) => {
    const { userId } = req;
    const { id: productId } = req.params;
    const quantityInCart =
      (await hget(`cart:${userId}`, `product:${productId}`)) || 0;
    if (quantityInCart) {
      await hdel(`cart:${userId}`, `product:${productId}`);
      return res.status(201).json({
        msg: "Đã xóa sản phẩm khỏi giỏ hàng",
        success: true,
      });
    }
    throwError("Sản phẩm đã bị xóa khỏi giỏ hàng", 404);
  }),
  empty: asyncHandler(async (req, res) => {
    const { userId } = req;
    const existingProducts = await hgetall(`cart:${userId}`);
    if (!existingProducts || Object.keys(existingProducts).length === 0) {
      return res.status(200).json({
        msg: "Chưa có sản phẩm nào trong giỏ hàng",
        products: [],
      });
    }
    const productIds = Object.keys(existingProducts).map((key) => key);
    for (const key of productIds) {
      await hdel(`cart:${userId}`, `product:${key}`);
    }
  }),
};
