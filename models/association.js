const {
  User,
  Product,
  ProductCategory,
  Category,
  CategorySubCategory,
  Image,
  Gift,
  Attribute,
  AttributeValue,
  Vendor,
  ProductGift,
  ProductVariantAttribute,
  Blog,
  BlogDetail,
  Tag,
  BlogDetailTag,
  Review,
  ReviewImage,
  Collection,
  ProductCollection,
  Order,
  OrderDetail,
  Coupon,
  UserCoupon,
  Address,
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
//user- address
User.hasMany(Address, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Address.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

//order --- product
Order.belongsToMany(Product, {
  as: "products",
  through: OrderDetail,
  foreignKey: "order_id",
  otherKey: "product_id",
});
Product.belongsToMany(Order, {
  as: "orders",
  through: OrderDetail,
  foreignKey: "product_id",
  otherKey: "order_id",
});
Product.hasMany(OrderDetail, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
OrderDetail.belongsTo(Product, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Order.hasMany(OrderDetail, {
  foreignKey: "order_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
OrderDetail.belongsTo(Order, {
  foreignKey: "order_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// user ---- order
User.hasMany(Order, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Order.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

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
// product ----- review
Product.belongsToMany(User, {
  as: "reviewers",
  through: Review,
  foreignKey: "product_id",
  otherKey: "user_id",
});
User.belongsToMany(Product, {
  as: "products",
  through: Review,
  foreignKey: "user_id",
  otherKey: "product_id",
});

Product.hasMany(Review, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Review.belongsTo(Product, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
User.hasMany(Review, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Review.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Review.hasMany(ReviewImage, {
  foreignKey: "review_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ReviewImage.belongsTo(Review, {
  foreignKey: "review_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

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
Product.belongsToMany(Gift, {
  as: "gifts",
  through: ProductGift,
  foreignKey: "product_id",
  otherKey: "gift_id",
});
Gift.belongsToMany(Product, {
  as: "products",
  through: ProductGift,
  foreignKey: "gift_id",
  otherKey: "product_id",
});
Product.hasMany(ProductGift, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ProductGift.belongsTo(Product, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Gift.hasMany(ProductGift, {
  foreignKey: "gift_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ProductGift.belongsTo(Gift, {
  foreignKey: "gift_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Category.belongsToMany(Category, {
  through: CategorySubCategory,
  as: "SubCategories",
  foreignKey: "category_id",
  otherKey: "sub_category_id",
});
Category.belongsToMany(Category, {
  through: CategorySubCategory,
  as: "Categories",
  foreignKey: "sub_category_id",
  otherKey: "category_id",
});
Category.hasMany(CategorySubCategory, {
  foreignKey: "category_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
CategorySubCategory.belongsTo(Category, {
  foreignKey: "category_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

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
//the Super Many-to-Many relationship
//https://sequelize.org/docs/v6/advanced-association-concepts/advanced-many-to-many/

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

Blog.hasMany(BlogDetail, {
  foreignKey: "blog_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
BlogDetail.belongsTo(Blog, {
  foreignKey: "blog_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
BlogDetail.belongsToMany(Tag, {
  as: "tags",
  through: BlogDetailTag,
  foreignKey: "blog_detail_id",
  otherKey: "tag_id",
});
BlogDetail.hasMany(BlogDetailTag, {
  foreignKey: "blog_detail_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
BlogDetailTag.belongsTo(BlogDetail, {
  foreignKey: "blog_detail_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Tag.hasMany(BlogDetailTag, {
  foreignKey: "tag_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
BlogDetailTag.belongsTo(Tag, {
  foreignKey: "tag_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Tag.belongsToMany(BlogDetail, {
  as: "blogdetails",
  through: BlogDetailTag,
  foreignKey: "tag_id",
  otherKey: "blog_detail_id",
});

module.exports = {
  Coupon,
  UserCoupon,
  Order,
  OrderDetail,
  Blog,
  BlogDetail,
  BlogDetailTag,
  Tag,
  Vendor,
  User,
  Product,
  Category,
  CategorySubCategory,
  Collection,
  ProductCollection,
  ProductCategory,
  Image,
  Gift,
  ProductGift,
  Attribute,
  AttributeValue,
  ProductVariantAttribute,
  Address,
  ReviewImage,
  Review,
};
