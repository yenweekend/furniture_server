const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");
const { slugify } = require("../../helpers/slugify");
const shortid = require("shortid");
const AttributeValue = sequelize.define(
  "AttributeValue",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: shortid.generate,
    },
    attr_id: {
      type: DataTypes.STRING,
      references: {
        model: "attribute",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    value: {
      type: DataTypes.STRING,
    },
    slug: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "attribute_value",
    timestamps: true,
  }
);
AttributeValue.beforeCreate(async (attribute, options) => {
  const slugName = slugify(attribute.value);
  attribute.slug = slugName;
});
AttributeValue.beforeBulkCreate((instances, options) => {
  for (let ins of instances) {
    const slugName = slugify(ins.value);
    ins.slug = slugName;
  }
});
module.exports = AttributeValue;
