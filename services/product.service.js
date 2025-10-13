const {
  AttributeValue,
  Attribute,
  Product,
  ProductVariantAttribute,
  Image,
  Vendor,
} = require("../models/association");
const { Op } = require("sequelize");

module.exports = {
  extractAttribute: (product) => {
    const { variants, ...rest } = product;
    if (variants.length === 0) {
      return product;
    } else {
      const formattedVariants = variants.map((variant) => {
        const { attributevalues, ...plainVariant } = variant; // Convert before spreading
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
      return {
        ...rest,
        attributes: finalAttributes,
        variants: formattedVariants,
      };
    }
  },
  findAllProductsWithdIds: async (productIds, order) => {
    const rows = await Product.findAll({
      where: {
        id: {
          [Op.in]: productIds,
        },
      },
      attributes: { exclude: ["vendor_id", "description"] },
      include: [
        {
          model: Vendor,
          attributes: ["title", "url", "slug"],
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
      order: order,
    });
    return rows;
  },
};
