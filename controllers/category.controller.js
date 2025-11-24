const {
  Category,
  CategorySubCategory,
  Vendor,
  Product,
  Attribute,
  AttributeValue,
  Image,
} = require("../models/association");
const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const ctrls = require("../services/product.service");
module.exports = {
  getPaginatedCategoryProducts: asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const currentPage = req.query.page || 1;
    const pageSize = req.query.pageSize || 30;
    const { sort, ...filters } = req.query;
    const offset = (currentPage - 1) * pageSize;
    // Tìm kiếm Category hoặc Subcategory theo slug
    const category = await Category.findOne({
      where: { slug },
      exclude: {
        attributes: ["createdAt", "updatedAt"],
      },
    });
    if (!category) {
      return res.status(404).json({ msg: "Không tìm thấy danh mục" });
    }
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
    let conditions = {};
    let vendorConditions = {};
    if (filters.price_range && Array.isArray(filters.price_range)) {
      const priceConditions = filters.price_range
        .map((range) => {
          //['gte_1000','betweeb_1000_2000']
          const parts = range.split("_");
          if (parts[0] === "gte") {
            return { price: { [Op.gte]: parseFloat(parts[1]) } }; //{ price: { [Op.gte]: parseFloat(1000) } }
          } else if (parts[0] === "lte") {
            return { price: { [Op.lte]: parseFloat(parts[1]) } };
          } else if (parts[0] === "between") {
            return {
              price: {
                [Op.between]: [parseFloat(parts[1]), parseFloat(parts[2])],
              },
            };
          }
          return null;
        })
        .filter(Boolean); // Loại bỏ các phần tử `null`

      if (priceConditions.length > 0) {
        conditions[Op.or] = priceConditions;
      }
    }
    if (filters.vendor && Array.isArray(filters.vendor)) {
      vendorConditions = {
        title: {
          [Op.in]: filters.vendor,
        },
      };
    }
    let vendorIds = new Set();
    const subcategories = await category.getSubCategories({
      attributes: ["id"],
    });
    let categoryIds;
    if (subcategories.length > 0) {
      categoryIds = subcategories.map((sub) => sub.id);
      categoryIds = [...categoryIds, category.id];
    } else {
      categoryIds = [category.id];
    }

    const allRows = await Product.findAll({
      attributes: { exclude: ["vendor_id", "id", "description"] },
      include: [
        {
          model: Vendor,
          attributes: ["id", "title", "url", "slug"],
        },
        {
          as: "categories",
          model: Category,
          where: { id: { [Op.in]: categoryIds } }, // Filter by category and subcategories
          through: { attributes: [] }, // Exclude junction table attributes
        },
      ],
    });

    // allRows will not contain filter so as to get all vendor
    if (allRows.length === 0) {
      return res.status(200).json({
        msg: "Chưa có sản phẩm nào",
        products: [],
        vendors: [],
        category,
        currentPage: currentPage,
        pageSize: pageSize,
        count: 0,
        totalPage: 0,
      });
    }
    const { count, rows } = await Product.findAndCountAll({
      attributes: { exclude: ["vendor_id", "description"] },
      where: conditions,
      include: [
        {
          model: Vendor,
          attributes: ["id", "title", "url", "slug"],
          where: vendorConditions,
          required: Object.keys(vendorConditions).length > 0, // get all vendor when there is no conditions although it get vendor_id null in product
        },
        {
          as: "categories",
          model: Category,
          where: { id: { [Op.in]: categoryIds } }, // Filter by category and subcategories
          through: { attributes: [] }, // Exclude junction table attributes
        },
        {
          model: Product,
          as: "variants",
          include: [
            {
              as: "attributevalues",
              model: AttributeValue,
              through: { attributes: [] }, // Exclude join table attributes
              include: {
                model: Attribute,
              },
            },
            {
              model: Image,
            },
          ],
        },
      ],
      limit: pageSize,
      offset: offset,
      order: order,
    });
    const formattedRows = rows.map((product) => {
      return ctrls.extractAttribute(product.toJSON());
    });
    allRows.forEach((product) => {
      if (product.Vendor) vendorIds.add(product.Vendor.id);
    });
    const vendors = await Vendor.findAll({
      where: {
        id: {
          [Op.in]: [...vendorIds],
        },
      },
    });
    return res.status(200).json({
      vendors,
      products: formattedRows,
      category,
      currentPage: currentPage,
      pageSize: pageSize,
      count: count,
      totalPage: Math.ceil(count / pageSize),
    });
  }),
  bulkCreate: asyncHandler(async (req, res) => {
    const categories = req.body.data;
    await Category.bulkCreate(categories);
    return res.status(201).json({
      msg: "Thêm categories thành công",
    });
  }),
  create: asyncHandler(async (req, res) => {
    const { parentCategory, subCategories } = req.body;
    const parent = await Category.findOrCreate({
      where: {
        title: parentCategory.title,
      },
    });
    if (parent && subCategories && subCategories.length > 0) {
      await parent.createSubCategories(subCategories);
    }
    return res.status(201).json({
      msg: "Tạo mới danh mục thành công",
    });
  }),
  addSubCategories: asyncHandler(async (req, res) => {
    const { parentCategoryId, subCategories } = req.body;
    const parent = await Category.findOrCreate({
      where: {
        id: parentCategoryId,
      },
    });
    if (parent && subCategories && subCategories.length > 0) {
      await parent.addSubCategories(subCategories);
    }
    return res.status(201).json({
      msg: "Thêm mới danh mục con thành công",
    });
  }),
};
