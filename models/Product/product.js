const { DataTypes, DATE } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");
const { slugify } = require("../../helpers/slugify");
const shortid = require("shortid");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: shortid.generate,
    },
    parent_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: "product",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price_original: {
      type: DataTypes.DECIMAL(10, 2),
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
    },
    slug: {
      type: DataTypes.TEXT,
    },
    sku: {
      type: DataTypes.STRING,
    },
    thumbnail: {
      type: DataTypes.TEXT,
    },
    thumbnailM: {
      type: DataTypes.TEXT,
    },
    single: { type: DataTypes.BOOLEAN, defaultValue: true },

    stock: {
      type: DataTypes.INTEGER,
    },
    url: {
      type: DataTypes.STRING,
    },
    vendor_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: "vendor",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true, // Để mô tả có thể không bắt buộc
    },
    variant_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "product",
    timestamps: true,
  }
);
Product.beforeBulkCreate((instances, options) => {
  for (let ins of instances) {
    const slugName = slugify(ins.title);
    ins.price = ins.price_original;
    ins.slug = slugName;
    ins.url = `/products/${slugName}`;
    ins.sku = shortid.generate(); // SKU format: NAME-XXXXXX
  }
});

Product.beforeCreate(async (product, options) => {
  const slugName = slugify(product.title);
  product.price = product.price_original;
  product.slug = slugName;
  product.url = `/products/${slugName}`;
  product.sku = shortid.generate(); // SKU format: NAME-XXXXXX
});
module.exports = Product;
