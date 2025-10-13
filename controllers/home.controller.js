const asyncHandler = require("express-async-handler");
const {
  Blog,
  BlogDetail,
  BlogDetailTag,
  Tag,
  Collection,
  Product,
  Vendor,
  Category,
  Coupon,
} = require("../models/association");
const {
  getProductCollectionBySlug,
} = require("../services/collection.service");
const { Op } = require("sequelize");
const ctrls = require("../services/product.service");
const productServices = require("../services/product.service");
const { sequelize } = require("../configs/postgreConn");
module.exports = {
  getContent: asyncHandler(async (req, res) => {
    const kitchenCollection = await getProductCollectionBySlug("yeu-bep");
    const schoolCollection = await getProductCollectionBySlug("back-to-school");
    const latestCollection = await getProductCollectionBySlug(
      "san-pham-moi",
      10
    );
    const sofaCategory = await Category.findOne({
      where: {
        slug: "sofa",
      },
    });
    const sofaProducts = await sofaCategory.getProducts();
    const showerCategory = await Category.findOne({
      where: { slug: "phong-tam" },
      exclude: {
        attributes: ["id", "createdAt", "updatedAt"],
      },
    });
    if (!showerCategory) {
      return res.status(404).json({ msg: "Không tìm thấy danh mục" });
    }
    const subcategories = await showerCategory.getSubCategories();
    let showerProducts = null;
    if (subcategories.length > 0) {
      const allProducts = await Promise.all(
        subcategories.map(async (subcategory) => {
          const products = await subcategory.getProducts({
            attributes: { exclude: ["vendor_id", "description"] },
            include: [
              {
                model: Vendor,
                attributes: ["title", "url", "slug"],
              },
            ],
            through: {
              attributes: [], // This ensures the join table attributes are not included
            },
          });
          return products;
        })
      );
      showerProducts = allProducts.flat();
    } else {
      const products = await Category.getProducts({
        attributes: { exclude: ["vendor_id", "id", "description"] },
        include: [
          {
            model: Vendor,
            attributes: ["title", "url", "slug"],
          },
        ],
        through: {
          attributes: [], // This ensures the join table attributes are not included
        },
      });
      showerProducts = products;
    }
    const blogs = await BlogDetail.findAll({
      include: {
        model: Blog,
        attributes: {
          exclude: ["id"],
        },
      },
      order: [["createdAt", "DESC"]], // Order by createdAt in descending order
      limit: 6, // Limit the results to 6
    });
    const coupons = await Coupon.findAll({
      where: {
        expire_date: {
          [Op.gte]: new Date(), // Get coupons where expire_date is greater than or equal to the current date
        },
      },
    });
    res.status(200).json({
      msg: "Get Home Content Successfully",
      data: {
        kitchenCollection,
        schoolCollection,
        latestCollection,
        sofaProducts: sofaProducts,
        showerProducts: showerProducts,
        blogs: blogs,
        coupons: coupons,
      },
    });
  }),

};
