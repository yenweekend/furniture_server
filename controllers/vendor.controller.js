const asyncHandler = require("express-async-handler");
const { Vendor } = require("../models/association");
const { Op } = require("sequelize");
module.exports = {
  createVendor: asyncHandler(async (req, res, next) => {
    try {
      const vendorTitles = req.body.vendors; // Expecting an array of vendor names from the request body

      if (!Array.isArray(vendorTitles) || vendorTitles.length === 0) {
        return res.status(400).json({ msg: "Invalid vendor data" });
      }

      // Step 1: Get existing vendors
      const existingVendors = await Vendor.findAll({
        where: { title: { [Op.in]: vendorTitles } },
        attributes: ["title"],
      });

      const existingTitles = existingVendors.map((vendor) => vendor.title);

      // Step 2: Filter out existing vendors
      const newVendors = vendorTitles
        .filter((title) => !existingTitles.includes(title))
        .map((title) => ({
          title,
        }));

      // Step 3: Insert new vendors
      if (newVendors.length > 0) {
        await Vendor.bulkCreate(newVendors);
      }

      res.status(201).json({
        msg: "Vendors added successfully",
      });
    } catch (error) {
      throw error;
    }
  }),
};
