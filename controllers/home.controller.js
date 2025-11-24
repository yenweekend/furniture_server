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
  getSearch: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.pageSize) || 15;
    const offset = (page - 1) * limit;
    const sort = req.query.sort || "createdAt_asc";
    // Split the sort query into column and direction
    const [sortColumn, sortDirection] = sort.split("_"); // Example: 'title_asc' => ['title', 'asc']
    // Validate sortDirection, default to 'asc' if not provided or invalid
    const validDirections = ["asc", "desc"];
    const direction = validDirections.includes(sortDirection)
      ? sortDirection
      : "asc";

    // Dynamically build the ORDER BY clause
    const orderByClause = `p."${sortColumn}" ${direction.toUpperCase()}`;
    const searchKey = req.query.q;
    let order = [];
    if (sort) {
      const [field, direct] = sort.split("_");
      if (
        ["price", "title", "createdAt"].includes(field) &&
        ["asc", "desc"].includes(direct)
      ) {
        order.push([field, direct.toUpperCase()]); // Sequelize uses "ASC" or "DESC"
      }
    }
    const results = await sequelize.query(
      `
      SELECT 
        p.id,
        COUNT(*) OVER() AS total_count
      FROM 
        product AS p
      WHERE 
        p.product_tsv @@ plainto_tsquery('english', :searchKey)
      LIMIT :limit OFFSET :offset
      `,
      {
        replacements: { searchKey: searchKey, limit: limit, offset: offset },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const productIds = results.map((row) => {
      return row.id;
    });
    const products = await productServices.findAllProductsWithdIds(
      productIds,
      order
    );
    const formattedProducts = products.map((product) =>
      ctrls.extractAttribute(product.toJSON())
    );
    const count = results.length > 0 ? results[0].total_count : 0;
    res.status(200).json({
      rows: formattedProducts,
      count: parseInt(count),
    });
  }),
};
