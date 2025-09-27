const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");
const { slugify } = require("../../helpers/slugify");
const shortid = require("shortid");

const Attribute = sequelize.define(
  "Attribute",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: shortid.generate,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "attribute",
    timestamps: true,
  }
);
Attribute.beforeCreate(async (attribute, options) => {
  const slugName = slugify(attribute.name);
  attribute.slug = slugName;
});
Attribute.beforeBulkCreate((instances, options) => {
  for (let ins of instances) {
    const slugName = slugify(ins.name);
    ins.slug = slugName;
  }
});
module.exports = Attribute;
