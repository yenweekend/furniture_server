const {
  Product,
  Image,
  Attribute,
  AttributeValue,
  Category,
  Collection,
  ProductVariantAttribute,
} = require("../models/association");

const { Op, Sequelize } = require("sequelize");
const asyncHandler = require("express-async-handler");
const ctrls = require("../services/product.service");

module.exports = {
  getProductDetail: asyncHandler(async (req, res) => {
    const slug = req.params.slug;
    const productDetail = await Product.findOne({
      where: { slug: slug },
      include: [
        {
          model: Vendor,
        },
      ],
    });
    if (!productDetail) {
      return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
    }
    let productRelevant = [];
    const categories = await productDetail.getCategories();
    if (categories.length > 0) {
      const categoryId = categories[0].id;
      productRelevant = await Product.findAll({
        attributes: { exclude: ["vendor_id", "description"] },
        where: {
          id: {
            [Op.ne]: productDetail.id, //exclude current product
          },
        },
        include: [
          {
            model: Vendor,
            attributes: ["title", "url", "slug"],
            required: false,
          },
          {
            as: "categories",
            model: Category,
            where: { id: categoryId }, // Filter by category and subcategories
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
        limit: 10,
      });
      productRelevant = productRelevant.map((product) => {
        return ctrls.extractAttribute(product.toJSON());
      });
    }
    if (!productDetail.single) {
      const variants = await productDetail.getVariants({
        attributes: {
          exclude: ["product_id"],
        },
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
      });
      const formattedVariants = variants.map((variant) => {
        const { attributevalues, ...plainVariant } = variant.toJSON(); // Convert before spreading
        return {
          ...plainVariant,
          attributes: attributevalues.reduce((acc, attr) => {
            acc[attr.Attribute.name] = attr.value;
            return acc;
          }, {}), // => {"Màu sắc": "đỏ", size: "xl", sex: "male"}
        };
      });
      // ✅ Extract attributes into a structured format
      const attributesMap = {};
      formattedVariants.forEach((variant) => {
        Object.entries(variant.attributes).map(([key, value]) => {
          if (!attributesMap[key]) {
            attributesMap[key] = new Set();
          }
          attributesMap[key].add(value);
        });
      });
      // ✅ Convert Set to an array
      const finalAttributes = Object.fromEntries(
        Object.entries(attributesMap).map(([key, value]) => [key, [...value]])
      );
      return res.status(200).json({
        msg: "Get product detail successfully",
        productDetail,
        variants: formattedVariants,
        attributes: finalAttributes,
        productRelevant: productRelevant,
      });
    }
    const feedbacks = await productDetail.getReviews({
      include: [
        {
          model: User,
          attributes: ["firstName", "lastName"],
        },
        {
          model: ReviewImage,
          attributes: ["id", "img_url"],
        },
      ],
    });
    res.status(201).json({
      msg: "Get product detail successfully",
      productDetail,
      productRelevant: productRelevant,
      feedback: feedbacks,
    });
  }),
  getViewedProducts: asyncHandler(async (req, res) => {
    const slugs = req.query.slugs;
    let viewedProducts = slugs.split(",").filter(Boolean);
    const products = await Product.findAll({
      where: {
        slug: {
          [Op.in]: viewedProducts,
        },
      },
      order: [
        [
          Sequelize.literal(
            `array_position(array[${viewedProducts
              .map((slug) => `'${slug}'`)
              .join(",")}], "Product"."slug")`
          ),
          "ASC",
        ],
      ],
      include: [
        {
          model: Vendor,
          attributes: ["title", "url", "slug"],
          required: false,
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
      limit: 10,
    });
    const formattedProducts = products.map((product) => {
      return ctrls.extractAttribute(product.toJSON());
    });
    return res.status(200).json({
      viewedProducts: formattedProducts,
    });
  }),
  createProducts: asyncHandler(async (req, res, next) => {
    const products = req.body.products;
    for (const product of products) {
      try {
        let vendor = null;
        // Chỉ tìm hoặc tạo Vendor nếu có brandTitle
        if (product.brandTitle) {
          [vendor] = await Vendor.findOrCreate({
            where: { title: product.brandTitle },
          });
        }
        let [category] = await Category.findOrCreate({
          where: { slug: product.slug },
        });
        const existingProduct = await Product.findOne({
          where: {
            title: product.title,
          },
        });
        if (existingProduct) {
          const productBelongedToCategory = await category.hasProduct(
            existingProduct
          );
          if (vendor) {
            await existingProduct.setVendor(vendor);
          }
          if (!productBelongedToCategory) {
            await category.addProduct(existingProduct);
          }
        } else {
          // Extract thumbnails
          const thumbnail = product.thumbnails[0] || null;
          const thumbnailM = product.thumbnails[1] || null;

          // Use association method `createProduct()` to create a product
          let newProduct;
          if (vendor) {
            // Nếu có vendor, tạo sản phẩm với vendor
            newProduct = await vendor.createProduct({
              title: product.title,
              price_original: product.price_original,
              thumbnail,
              thumbnailM,
            });
          } else {
            // Nếu không có vendor, tạo sản phẩm trực tiếp
            newProduct = await Product.create({
              title: product.title,
              price_original: product.price_original,
              thumbnail,
              thumbnailM,
            });
          }
          await category.addProduct(newProduct);
        }
      } catch (error) {
        console.error(`Error creating product: ${product.title}`, error);
      }
    }
    // Send response after processing all products
    res.status(201).json({ msg: "Products processed successfully" });
  }),
  addVariants: asyncHandler(async (req, res, next) => {
    const { parent_id, variant, attributes } = req.body.data;
    const { variant_title, price_original, stock } = variant;

    const product = await Product.findOne({
      where: {
        id: parent_id,
      },
    });
    const { title } = product;
    if (!product) {
      return res.status(404).json({
        msg: "không tìm thấy sản phẩm",
      });
    }
    console.log({ variant_title, price_original, stock, title });
    const variantProduct = await product.createVariant({
      variant_title,
      price_original,
      stock,
      title,
    });
    if (attributes && attributes.length > 0) {
      const attributeEntries = attributes.map((attrValueId) => ({
        product_variant_id: variantProduct.id,
        attr_value_id: attrValueId,
      }));
      await ProductVariantAttribute.bulkCreate(attributeEntries);
    }
    return res.status(201).json({
      msg: "Thêm biến thể cho sản phẩm thành công",
    });
  }),
  assignVariant: asyncHandler(async (req, res, next) => {
    const { variantId, attributes } = req.body.data;

    if (attributes && attributes.length > 0) {
      const attributeEntries = attributes.map((attrValueId) => ({
        product_variant_id: variantId,
        attr_value_id: attrValueId,
      }));
      await ProductVariantAttribute.bulkCreate(attributeEntries);
    }
    return res.status(201).json({
      msg: "Thêm biến thể cho sản phẩm thành công",
    });
  }),

  updateDescription: asyncHandler(async (req, res, next) => {
    try {
      const details = req.body.details;
      for (const product of details) {
        await Product.update(
          { description: product.description },
          { where: { title: product.title } }
        );
      }
      res.status(201).json({ msg: "Update product detail successfully" });
    } catch (error) {
      next(error);
    }
  }),
  updateProductCategory: asyncHandler(async (req, res, next) => {
    try {
      const productsToUpdate = req.body.products;

      if (!Array.isArray(productsToUpdate) || productsToUpdate.length === 0) {
        return res
          .status(400)
          .json({ msg: "Không có dữ liệu sản phẩm để cập nhật" });
      }

      for (const item of productsToUpdate) {
        try {
          // Tìm sản phẩm theo tên (title)
          const product = await Product.findOne({
            where: { title: item.title },
          });
          if (!product) {
            console.warn(`Không tìm thấy sản phẩm có tên: ${item.title}`);
            continue; // Bỏ qua nếu không tìm thấy
          }
          // Tìm danh mục theo tên
          const category = await Category.findOne({
            where: { slug: item.slug },
          });
          if (!category) {
            console.warn(`Không tìm thấy danh mục có tên: ${item.slug}`);
            continue; // Bỏ qua nếu không tìm thấy danh mục
          }
          await product.setCategories([category]); // Thay thế danh mục cũ
        } catch (err) {
          console.error(`Error creating product: ${item.title}`, err);
        }
      }
      res
        .status(200)
        .json({ msg: "Cập nhật quan hệ sản phẩm - danh mục thành công" });
    } catch (error) {
      next(error);
    }
  }),
  addProductCollectionRelation: asyncHandler(async (req, res) => {
    const products = req.body.products;
    for (const product of products) {
      try {
        let vendor = null;
        // Chỉ tìm hoặc tạo Vendor nếu có brandTitle
        if (product.brandTitle) {
          [vendor] = await Vendor.findOrCreate({
            where: { title: product.brandTitle },
          });
        }
        let [collection, created] = await Collection.findOrCreate({
          where: { slug: product.slug },
          defaults: {
            title: product.collectionTitle,
          },
        });
        // Extract thumbnails
        const thumbnail = product.thumbnails[0] || null;
        const thumbnailM = product.thumbnails[1] || null;

        // Use association method `createProduct()` to create a product
        let newProduct;
        if (vendor) {
          const existingProduct = await Product.findOne({
            where: {
              title: product.title,
              vendor_id: vendor.id,
            },
          });
          if (!existingProduct) {
            newProduct = await vendor.createProduct({
              title: product.title,
              price_original: product.price_original,
              thumbnail,
              thumbnailM,
            });
          } else {
            newProduct = existingProduct;
          }
        } else {
          // Nếu không có vendor, tạo sản phẩm trực tiếp
          [newProduct] = await Product.findOrCreate({
            where: {
              title: product.title,
            },
            defaults: {
              title: product.title,
              price_original: product.price_original,
              thumbnail,
              thumbnailM,
            },
          });
        }
        await collection.addProduct(newProduct);
      } catch (error) {
        console.error(`Error creating product: ${product.title}`, error);
      }
    }
    // Send response after processing all products
    res.status(201).json({ msg: "Products processed successfully" });
  }),
  updateProductsThumbnails: asyncHandler(async (req, res, next) => {
    try {
      const products = req.body.products;
      for (const product of products) {
        try {
          const thumbnail = product.thumbnails[0];
          const thumbnailM = product.thumbnails[1];

          // Find the product using a specific identifier (like title or id)
          const existingProduct = await Product.findOne({
            where: { title: product.title }, // assuming you want to find by title
          });

          if (existingProduct) {
            // Update the found product with the new thumbnail values
            await Product.update(
              { thumbnail, thumbnailM },
              {
                where: { title: product.title },
              }
            );
          } else {
            console.log(`Product with title ${product.title} not found`);
          }
        } catch (error) {
          console.error(`Error updating product: ${product.title}`, error);
        }
      }

      res.status(201).json({ msg: "Products processed successfully" });
    } catch (error) {
      next(error); // Passes error to error-handling middleware
    }
  }),
  addProductVariantImages: asyncHandler(async (req, res, next) => {
    const productId = req.params.id;
    const images = req.body.images;
    const productVariant = await Product.findOne({
      where: {
        id: productId,
      },
    });
    if (!productVariant) {
      return res.status(404).json({
        msg: "Sản phẩm không tồn tại",
      });
    }
    for (const img of images) {
      try {
        await productVariant.createImage({ img_url: img });
      } catch (error) {
        console.log(error);
      }
    }
    return res.status(201).json({
      msg: "Thêm ảnh cho sản phẩm thành công",
    });
  }),
  createProductFromCollection: asyncHandler(async (req, res, next) => {
    const products = req.body.products;
    for (const product of products) {
      try {
        let vendor = null;
        // Chỉ tìm hoặc tạo Vendor nếu có brandTitle
        if (product.brandTitle) {
          [vendor] = await Vendor.findOrCreate({
            where: { title: product.brandTitle },
          });
        }
        let collection = await Collection.findOne({
          where: { slug: product.slug },
        });
        const existingProduct = await Product.findOne({
          where: {
            title: product.title,
          },
        });
        if (existingProduct) {
          const productBelongedToCollection = await collection.hasProduct(
            existingProduct
          );
          if (vendor) {
            await existingProduct.setVendor(vendor);
          }
          if (!productBelongedToCollection) {
            await collection.addProduct(existingProduct);
          }
        } else {
          // Extract thumbnails
          const thumbnail = product.thumbnails[0] || null;
          const thumbnailM = product.thumbnails[1] || null;

          // Use association method `createProduct()` to create a product
          let newProduct;
          if (vendor) {
            // Nếu có vendor, tạo sản phẩm với vendor
            newProduct = await vendor.createProduct({
              title: product.title,
              price_original: product.price_original,
              thumbnail,
              thumbnailM,
            });
          } else {
            // Nếu không có vendor, tạo sản phẩm trực tiếp
            newProduct = await Product.create({
              title: product.title,
              price_original: product.price_original,
              thumbnail,
              thumbnailM,
            });
          }
          await collection.addProduct(newProduct);
        }
      } catch (error) {
        console.error(`Error creating product: ${product.title}`, error);
      }
    }
    // Send response after processing all products
    res.status(201).json({ msg: "Products processed successfully" });
  }),
};
