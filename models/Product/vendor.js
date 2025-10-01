const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");
const shortid = require("shortid");
const { slugify } = require("../../helpers/slugify");

const Vendor = sequelize.define(
  "Vendor",
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
    url: {
      type: DataTypes.STRING,
    },
    slug: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "vendor",
    timestamps: true,
  }
);
Vendor.beforeBulkCreate((vendors, options) => {
  for (let vendor of vendors) {
    const slugName = slugify(vendor.title);
    vendor.slug = slugName;
    vendor.url = `/vendor/${slugName}`;
  }
});

Vendor.beforeCreate(async (vendor, options) => {
  const slugName = slugify(vendor.title);
  vendor.slug = slugName;
  vendor.url = `/vendor/${slugName}`;
});
module.exports = Vendor;
