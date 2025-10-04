const {
  User,
  Coupon,
  UserCoupon,

  Product,
  Category,
  CategorySubCategory,
  ProductCategory,
  Image,
  Attribute,
  AttributeValue,
  Collection,
  Review,
  ReviewImage,
  ProductVariantAttribute,
  ProductCollection,
  Vendor,
} = require("./index");

// user - coupon

User.belongsToMany(Coupon, {
  as: "coupons",
  through: UserCoupon,
  foreignKey: "user_id",
  otherKey: "coupon_id",
});
Coupon.belongsToMany(User, {
  as: "users",
  through: UserCoupon,
  foreignKey: "coupon_id",
  otherKey: "user_id",
});
User.hasMany(UserCoupon, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
UserCoupon.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Coupon.hasMany(UserCoupon, {
  foreignKey: "coupon_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
UserCoupon.belongsTo(Coupon, {
  foreignKey: "coupon_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Product - Collection
Product.belongsToMany(Collection, {
  as: "collections",
  through: ProductCollection,
  foreignKey: "product_id",
  otherKey: "collection_id",
});
Collection.belongsToMany(Product, {
  as: "products",
  through: ProductCollection,
  foreignKey: "collection_id",
  otherKey: "product_id",
});
Product.hasMany(ProductCollection, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ProductCollection.belongsTo(Product, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ProductCollection.belongsTo(Collection, {
  foreignKey: "collection_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Collection.hasMany(ProductCollection, {
  foreignKey: "collection_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// product - category

Product.belongsToMany(Category, {
  as: "categories",
  through: ProductCategory,
  foreignKey: "product_id",
  otherKey: "category_id",
});
Category.belongsToMany(Product, {
  as: "products",
  through: ProductCategory,
  foreignKey: "category_id",
  otherKey: "product_id",
});
Product.hasMany(ProductCategory, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ProductCategory.belongsTo(Product, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Category.hasMany(ProductCategory, {
  foreignKey: "category_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ProductCategory.belongsTo(Category, {
  foreignKey: "category_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

//product -image

Product.hasMany(Image, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Image.belongsTo(Product, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// product - attribute

Attribute.hasMany(AttributeValue, {
  foreignKey: "attr_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
AttributeValue.belongsTo(Attribute, {
  foreignKey: "attr_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

AttributeValue.belongsToMany(Product, {
  as: "productvariants",
  through: ProductVariantAttribute,
  foreignKey: "attr_value_id",
  otherKey: "product_variant_id",
});
Product.belongsToMany(AttributeValue, {
  as: "attributevalues",
  through: ProductVariantAttribute,
  foreignKey: "product_variant_id",
  otherKey: "attr_value_id",
});
AttributeValue.hasMany(ProductVariantAttribute, {
  foreignKey: "attr_value_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ProductVariantAttribute.belongsTo(AttributeValue, {
  foreignKey: "attr_value_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Product.hasMany(ProductVariantAttribute, {
  foreignKey: "product_variant_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ProductVariantAttribute.belongsTo(Product, {
  foreignKey: "product_variant_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// product - product

Product.hasMany(Product, {
  foreignKey: "parent_id",
  as: "variants",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Product.belongsTo(Product, {
  foreignKey: "parent_id",
  as: "parent",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// product - vendor

Vendor.hasMany(Product, {
  foreignKey: "vendor_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Product.belongsTo(Vendor, {
  foreignKey: "vendor_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

module.exports = {
  Product,
  Category,
  CategorySubCategory,
  Collection,
  ProductCollection,
  ProductCategory,
  Image,
  Attribute,
  AttributeValue,
  ProductVariantAttribute,
  Vendor,

  User,
  UserCoupon,
  Coupon,
};
