const {
  Category,
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
  // Lấy sản phẩm theo category với pagination và filters
  getPaginatedCategoryProducts: asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const currentPage = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 30;
    const offset = (currentPage - 1) * pageSize;

    const { sort, ...filters } = req.query;

    // Tìm category theo slug
    const category = await Category.findOne({
      where: { slug },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    if (!category) {
      return res.status(404).json({ msg: "Không tìm thấy danh mục" });
    }

    // Xử lý sort
    const order = [];
    if (sort) {
      const [field, direction] = sort.split("_");
      const validFields = ["price", "title", "createdAt"];
      const validDirections = ["asc", "desc"];
      if (validFields.includes(field) && validDirections.includes(direction)) {
        order.push([field, direction.toUpperCase()]);
      }
    }

    // Xử lý filter giá
    const conditions = {};
    if (Array.isArray(filters.price_range)) {
      const priceConditions = filters.price_range
        .map((range) => {
          const [type, ...values] = range.split("_");
          switch (type) {
            case "gte":
              return { price: { [Op.gte]: parseFloat(values[0]) } };
            case "lte":
              return { price: { [Op.lte]: parseFloat(values[0]) } };
            case "between":
              return {
                price: {
                  [Op.between]: [parseFloat(values[0]), parseFloat(values[1])],
                },
              };
            default:
              return null;
          }
        })
        .filter(Boolean);

      if (priceConditions.length) conditions[Op.or] = priceConditions;
    }

    // Xử lý filter vendor
    let vendorConditions = {};
    if (Array.isArray(filters.vendor) && filters.vendor.length > 0) {
      vendorConditions = { title: { [Op.in]: filters.vendor } };
    }

    // Lấy id của category và subcategories
    const subcategories = await category.getSubCategories({
      attributes: ["id"],
    });
    const categoryIds = [category.id, ...subcategories.map((sub) => sub.id)];

    // Lấy products với filters và pagination
    const { count, rows } = await Product.findAndCountAll({
      attributes: { exclude: ["vendor_id", "description"] },
      where: conditions,
      include: [
        {
          model: Vendor,
          attributes: ["id", "title", "url", "slug"],
          where: vendorConditions,
          required: Object.keys(vendorConditions).length > 0,
        },
        {
          as: "categories",
          model: Category,
          where: { id: { [Op.in]: categoryIds } },
          through: { attributes: [] },
        },
        {
          model: Product,
          as: "variants",
          include: [
            {
              as: "attributevalues",
              model: AttributeValue,
              through: { attributes: [] },
              include: { model: Attribute },
            },
            { model: Image },
          ],
        },
      ],
      limit: pageSize,
      offset,
      order,
    });

    if (rows.length === 0) {
      return res.status(200).json({
        msg: "Chưa có sản phẩm nào",
        products: [],
        vendors: [],
        category,
        currentPage,
        pageSize,
        count: 0,
        totalPage: 0,
      });
    }

    // Format product
    const formattedRows = rows.map((product) =>
      ctrls.extractAttribute(product.toJSON())
    );

    // Lấy vendor từ products hiện tại
    const vendorIds = [
      ...new Set(rows.map((p) => p.Vendor?.id).filter(Boolean)),
    ];
    const vendors = await Vendor.findAll({
      where: { id: { [Op.in]: vendorIds } },
    });

    return res.status(200).json({
      vendors,
      products: formattedRows,
      category,
      currentPage,
      pageSize,
      count,
      totalPage: Math.ceil(count / pageSize),
    });
  }),

  // Thêm nhiều categories
  bulkCreate: asyncHandler(async (req, res) => {
    const categories = req.body.data;
    if (!Array.isArray(categories) || !categories.length) {
      return res.status(400).json({ msg: "Data không hợp lệ" });
    }

    await Category.bulkCreate(categories);
    return res.status(201).json({ msg: "Thêm categories thành công" });
  }),

  // Tạo category mới cùng subcategories
  create: asyncHandler(async (req, res) => {
    const { parentCategory, subCategories } = req.body;
    if (!parentCategory || !parentCategory.title) {
      return res.status(400).json({ msg: "parentCategory không hợp lệ" });
    }

    const [parent] = await Category.findOrCreate({
      where: { title: parentCategory.title },
    });

    if (subCategories && subCategories.length > 0) {
      await parent.createSubCategories(subCategories);
    }

    return res.status(201).json({ msg: "Tạo mới danh mục thành công" });
  }),

  // Thêm subcategories vào category đã có
  addSubCategories: asyncHandler(async (req, res) => {
    const { parentCategoryId, subCategories } = req.body;
    if (
      !parentCategoryId ||
      !Array.isArray(subCategories) ||
      !subCategories.length
    ) {
      return res.status(400).json({ msg: "Input không hợp lệ" });
    }

    const parent = await Category.findByPk(parentCategoryId);
    if (!parent) {
      return res.status(404).json({ msg: "Danh mục không tồn tại" });
    }

    await parent.addSubCategories(subCategories);
    return res.status(201).json({ msg: "Thêm mới danh mục con thành công" });
  }),
};
