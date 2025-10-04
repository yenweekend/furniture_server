const {
  Collection,
  ProductCollection,
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
  createCollections: asyncHandler(async (req, res) => {
    const collections = req.body.collections;

    if (!Array.isArray(collections) || collections.length === 0) {
      return res.status(400).json({ msg: "Invalid collection data" });
    }
    const collectionTitles = collections.map((item) => item.title);

    // Check existing collections in DB
    const existingCollections = await Collection.findAll({
      where: { title: { [Op.in]: collectionTitles } },
      attributes: ["title"],
    });

    const existingTitles = existingCollections.map(
      (collection) => collection.title
    );

    // Filter out duplicates and include thumbnails
    const newCollections = collections.filter(
      (item) => !existingTitles.includes(item.title)
    );

    if (newCollections.length > 0) {
      await Collection.bulkCreate(newCollections); // Now includes title + thumbnail
    }

    res.status(201).json({
      msg: "Collections added successfully",
    });
  }),
  getPaginatedCollectionProducts: asyncHandler(async (req, res, next) => {
    const { slug } = req.params;
    const currentPage = req.query.page || 1;
    const pageSize = req.query.pageSize || 30;
    const { sort, ...filters } = req.query;
    const offset = (currentPage - 1) * pageSize;

    // Tìm kiếm Category hoặc Subcategory theo slug
    const collection = await Collection.findOne({
      where: { slug: slug },
      exclude: {
        attributes: ["createdAt", "updatedAt"],
      },
    });

    if (!collection) {
      return res.status(404).json({ msg: "Không tìm thấy sưu tập" });
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
            return { price: { [Op.gte]: parseFloat(parts[1]) } };
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
    const allRows = await Product.findAll({
      attributes: { exclude: ["vendor_id", "description"] },
      where: conditions,
      include: [
        {
          model: Vendor,
          attributes: ["id", "title", "url", "slug"],
        },
        {
          as: "collections",
          model: Collection,
          where: { id: collection.id }, // Filter by category and subcategories
          through: { attributes: [] }, // Exclude junction table attributes
        },
      ],
    });
    if (allRows.length === 0) {
      return res.status(200).json({
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
          attributes: ["title", "url", "slug"],
          where: vendorConditions,
          required: Object.keys(vendorConditions).length > 0, // get all vendor when there is no conditions although it get vendor_id null in product
        },
        {
          as: "collections",
          model: Collection,
          where: { id: collection.id }, // Filter by category and subcategories
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
    return res.status(201).json({
      vendors,
      products: formattedRows,
      collection,
      currentPage: currentPage,
      pageSize: pageSize,
      count: count,
      totalPage: Math.ceil(count / pageSize),
    });
  }),
};
