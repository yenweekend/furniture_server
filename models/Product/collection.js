const { DataTypes } = require("sequelize");
const { sequelize } = require("../../configs/postgreConn");
const { slugify } = require("../../helpers/slugify");
const shortid = require("shortid");

const Collection = sequelize.define(
  "Collection",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: shortid.generate,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.TEXT,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "collection",
    timestamps: true,
  }
);
Collection.beforeCreate(async (collection, options) => {
  const slugName = slugify(collection.title);
  collection.url = `/collections/${slugName}`;
  collection.slug = slugName;
});
Collection.beforeBulkCreate((instances, options) => {
  for (let ins of instances) {
    const slugName = slugify(ins.title);
    ins.slug = slugName;
    ins.url = `/collections/${slugName}`;
  }
});
Collection.beforeUpdate(async (collection, options) => {
  if (collection.changed("title")) {
    const slugName = slugify(collection.title);
    collection.slug = slugName;
    collection.url = `/collections/${slugName}`;
  }
});

module.exports = Collection;
