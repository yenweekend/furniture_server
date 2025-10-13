const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");
const { slugify } = require("../../helpers/slugify");
const shortid = require("shortid");
const Gift = sequelize.define(
  "Gift",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: shortid.generate,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true, // Để mô tả có thể không bắt buộc
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
    url: {
      type: DataTypes.STRING,
    },
    vendor_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "vendor",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    category_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "category",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "gift",
    timestamps: true,
  }
);
Gift.beforeBulkCreate((instances, options) => {
  for (let ins of instances) {
    const slugName = slugify(ins.title);
    ins.slug = slugName;
    ins.url = `/gift/${slugName}`;
    ins.sku = shortid.generate();
  }
});

Gift.beforeCreate(async (product, options) => {
  const slugName = slugify(product.title);
  product.slug = slugName;
  product.url = `/gift/${slugName}`;
  product.sku = shortid.generate();
});
module.exports = Gift;
