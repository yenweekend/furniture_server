// User
const User = require("./user");

const Coupon = require("./coupon");
const UserCoupon = require("./user_coupon");

// Product
const Product = require("./Product/product");
const Category = require("./Product/category");
const CategorySubCategory = require("./Product/category_subcategory");
const ProductCategory = require("./Product/product_category");
const Gift = require("./Product/gift");
const ProductGift = require("./Product/product_gift");
const Image = require("./Product/image");
const Attribute = require("./Product/attribute");
const AttributeValue = require("./Product/attribute_value");
const Collection = require("./Product/collection");

const ProductVariantAttribute = require("./Product/product_variant_attribute");
const ProductCollection = require("./Product/product_collection");
const Vendor = require("./Product/vendor");
const Address = require("./address");

module.exports = {
  User,
Address,
  Product,
  Category,
  CategorySubCategory,
  ProductCategory,
  Image,
  Attribute,
  AttributeValue,
  Collection,

  ProductVariantAttribute,
  ProductCollection,
  Vendor,

  Coupon,
  UserCoupon,
  Gift,
  ProductGift,
};
