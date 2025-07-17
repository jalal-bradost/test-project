const router = require("../../config/express");
const { query } = require("express-validator");
const {
  OPData,
  ProductStorage,
  sequelize,
  Patient,
  OPOperationType,
  SWData,
  ICUData,
  ICUOperationType,
  ProductInvoice,
  SWOperationType
} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");
// const requirePermissions = require("../../middlware/requirePermissions"); // Uncomment if needed
// const permissionMap = require("../../utils/permissionMap"); // Uncomment if needed
const { Op } = require("sequelize"); // For array 'in' queries

/**
 * @function getBulkProductInfo
 * @description Fetches `ProductStorage` and `ProductInvoice` data in bulk for a given set of barcodes.
 * This optimizes database calls by retrieving all necessary product-related information
 * in two efficient queries instead of N individual queries.
 * @param {string[]} barcodes - An array of unique product barcodes.
 * @returns {Promise<Object>} An object mapping barcodes to their pharmacy storage status and latest invoice price.
 */
const getBulkProductInfo = async (barcodes) => {
  if (!barcodes || barcodes.length === 0) {
    return {};
  }

  const uniqueBarcodes = [...new Set(barcodes)]; // Ensure uniqueness of barcodes

  // 1. Bulk query for ProductStorage to check if products are in pharmacy storage
  const productStorages = await ProductStorage.findAll({
    where: {
      barcode: { [Op.in]: uniqueBarcodes },
      storageId: 15, // Assuming pharmacy storage ID is consistently 15
    },
    attributes: ['barcode'], // We only need the barcode to know if it exists
  });
  const productStorageMap = new Map();
  productStorages.forEach(ps => productStorageMap.set(ps.barcode, true)); // Map barcode to true if found

  // 2. Bulk query for Latest ProductInvoice prices using a subquery to find the latest 'createdAt' per barcode
  const latestInvoices = await sequelize.query(
    `SELECT t1.barcode, t1.price
     FROM "ProductInvoices" t1
     INNER JOIN (
         SELECT barcode, MAX("createdAt") AS max_created_at
         FROM "ProductInvoices"
         WHERE barcode IN (:barcodes)
         GROUP BY barcode
     ) t2 ON t1.barcode = t2.barcode AND t1."createdAt" = t2.max_created_at`,
    {
      replacements: { barcodes: uniqueBarcodes },
      type: sequelize.QueryTypes.SELECT,
    }
  );
  const latestInvoiceMap = new Map();
  latestInvoices.forEach(inv => latestInvoiceMap.set(inv.barcode, inv.price)); // Map barcode to its latest price

  // Combine the results into a single map for easy lookup
  const result = {};
  uniqueBarcodes.forEach(barcode => {
    result[barcode] = {
      isProductInPharmacyStorage: productStorageMap.has(barcode),
      latestInvoicePrice: latestInvoiceMap.get(barcode) || 0, // Default to 0 if no invoice found
    };
  });
  return result;
};

/**
 * @function calculateProductCost
 * @description Calculates the final product cost based on the invoice price, perBox, and usageFactor.
 * This logic replicates the original `cleanItems` calculation.
 * @param {Object} itemProduct - The product object from the item (e.g., item.product).
 * @param {number} latestInvoicePrice - The latest price from `ProductInvoice`.
 * @returns {number} The calculated cost per unit of product.
 */
const calculateProductCost = (itemProduct, latestInvoicePrice) => {
  let productCost = 0;
  if (latestInvoicePrice > 0) {
    const { perBox } = itemProduct;
    // Adjust price by perBox if applicable
    productCost = perBox > 1 ? latestInvoicePrice / perBox : latestInvoicePrice;
  }
  // Extract usage factor (e.g., 'x10' from "Product X10")
  const usageFactorMatch = itemProduct.name.trim().match(/x(\d+)$/);
  const usageFactor = usageFactorMatch
    ? parseInt(usageFactorMatch[1], 10)
    : 1;
  // Divide by usage factor
  productCost = productCost / usageFactor;
  return productCost;
};


router.get(
  "/reports/top-products",
  [
    query("departmentType")
      .optional()
      .isIn(["ALL", "OP", "ICU", "SW"]) // Added "ALL" as a valid option
      .withMessage("Invalid departmentType. Must be ALL, OP, ICU, or SW."),
    query("startDate") // New validation for startDate
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Start date must be a valid ISO 8601 date."),
    query("endDate") // New validation for endDate
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("End date must be a valid ISO 8601 date."),
  ],
  returnInCaseOfInvalidation, // Middleware to handle validation errors
  // requirePermissions(permissionMap.VIEW_REPORTS), // Example: Uncomment and adjust permissions
  async (req, res) => {
    try {
      const { departmentType, startDate, endDate } = req.query; // Destructure new date parameters
      const allItemsAggregated = []; // Collect all relevant items from all departments
      const allBarcodes = new Set(); // Collect all unique barcodes for bulk fetching

      // Normalize endDate to the end of the day for inclusive range
      let effectiveEndDate = endDate;
      if (effectiveEndDate) {
        effectiveEndDate.setHours(23, 59, 59, 999);
      }

      // Helper function to check if an item's createdAt falls within the date range
      // This is updated to skip filtering if startDate or effectiveEndDate are not provided
      const isItemInDateRange = (itemCreatedAt) => {
        // If no date range is provided, all items pass the date filter
        if (!startDate && !effectiveEndDate) {
            return true;
        }

        // If a date filter is active, but the item itself has no creation date, it fails the filter
        if (!itemCreatedAt) {
            return false;
        }

        const itemDate = new Date(itemCreatedAt);
        let meetsDateCriteria = true;

        if (startDate && itemDate < startDate) {
          meetsDateCriteria = false;
        }
        if (effectiveEndDate && itemDate > effectiveEndDate) {
          meetsDateCriteria = false;
        }
        return meetsDateCriteria;
      };

      // --- Fetch and process OP Data ---
      if (!departmentType || departmentType === "ALL" || departmentType === "OP") {
        const opDatas = await OPData.findAll({
          attributes: ['opId', 'perfusionItems', 'anesthesiaItems', 'scrubNurseItems'],
          include: { model: OPOperationType, attributes: ['name'] } // Include department name
        });
        opDatas.forEach(data => {
          // Process items from each OP sub-department separately for 'top-products' report
          if (data.perfusionItems) {
            data.perfusionItems.forEach(item => {
              if (item && item.barcode && item.product && item.quantity !== undefined && isItemInDateRange(item.createdAt)) { // Apply date filter
                allItemsAggregated.push({
                  barcode: item.barcode,
                  quantity: item.quantity,
                  product: item.product, // Keep full product object for image/name initially
                  departmentName: 'PERFUSION', // Specific OP sub-department
                  departmentType: 'OP'
                });
                allBarcodes.add(item.barcode);
              }
            });
          }
          if (data.anesthesiaItems) {
            data.anesthesiaItems.forEach(item => {
              if (item && item.barcode && item.product && item.quantity !== undefined && isItemInDateRange(item.createdAt)) { // Apply date filter
                allItemsAggregated.push({
                  barcode: item.barcode,
                  quantity: item.quantity,
                  product: item.product,
                  departmentName: 'ANESTHESIA', // Specific OP sub-department
                  departmentType: 'OP'
                });
                allBarcodes.add(item.barcode);
              }
            });
          }
          if (data.scrubNurseItems) {
            data.scrubNurseItems.forEach(item => {
              if (item && item.barcode && item.product && item.quantity !== undefined && isItemInDateRange(item.createdAt)) { // Apply date filter
                allItemsAggregated.push({
                  barcode: item.barcode,
                  quantity: item.quantity,
                  product: item.product,
                  departmentName: 'SCRUB NURSE', // Specific OP sub-department
                  departmentType: 'OP'
                });
                allBarcodes.add(item.barcode);
              }
            });
          }
        });
      }

      // --- Fetch and process ICU Data ---
      if (!departmentType || departmentType === "ALL" || departmentType === "ICU") {
        const icuDatas = await ICUData.findAll({
          attributes: ['icuId', 'items'],
          include: { model: ICUOperationType, attributes: ['name'] }
        });
        icuDatas.forEach(data => {
          // Use ICUOperationType name or default to 'ICU'
          const deptName = data.ICUOperationType ? data.ICUOperationType.name : 'ICU';
          if (data.items) {
            data.items.forEach(item => {
              if (item && item.barcode && item.product && item.quantity !== undefined && isItemInDateRange(item.createdAt)) { // Apply date filter
                allItemsAggregated.push({
                  barcode: item.barcode,
                  quantity: item.quantity,
                  product: item.product,
                  departmentName: deptName,
                  departmentType: 'ICU'
                });
                allBarcodes.add(item.barcode);
              }
            });
          }
        });
      }

      // --- Fetch and process SW Data ---
      if (!departmentType || departmentType === "ALL" || departmentType === "SW") {
        const swDatas = await SWData.findAll({
          attributes: ['swId', 'items'],
          include: { model: SWOperationType, attributes: ['name'] }
        });
        swDatas.forEach(data => {
          // Use SWOperationType name or default to 'SURGICAL WARD'
          const deptName = data.SWOperationType ? data.SWOperationType.name : 'SURGICAL WARD';
          if (data.items) {
            data.items.forEach(item => {
              if (item && item.barcode && item.product && item.quantity !== undefined && isItemInDateRange(item.createdAt)) { // Apply date filter
                allItemsAggregated.push({
                  barcode: item.barcode,
                  quantity: item.quantity,
                  product: item.product,
                  departmentName: deptName,
                  departmentType: 'SW'
                });
                allBarcodes.add(item.barcode);
              }
            });
          }
        });
      }

      // Perform a single bulk fetch for all product-related info
      const bulkProductInfo = await getBulkProductInfo(Array.from(allBarcodes));

      // Aggregate quantities, costs, prices, and profits for each product per department type
      const finalAggregatedProducts = new Map(); // Key: `${barcode}-${departmentType}-${departmentName}`
      allItemsAggregated.forEach(item => {
        const key = `${item.barcode}-${item.departmentType}-${item.departmentName}`;
        if (!finalAggregatedProducts.has(key)) {
          finalAggregatedProducts.set(key, {
            barcode: item.barcode,
            code: item.product.code,
            productName: item.product.name,
            productImage: item.product.image,
            departmentName: item.departmentName,
            departmentType: item.departmentType,
            totalQuantity: 0,
            totalCost: 0,
            totalPrice: 0,   // Initialize totalPrice
            totalProfit: 0,  // Initialize totalProfit
          });
        }
        const aggregatedItem = finalAggregatedProducts.get(key);
        aggregatedItem.totalQuantity += item.quantity;

        const productInfo = bulkProductInfo[item.barcode];
        if (productInfo) {
          // Calculate cost per unit
          const costPerUnit = calculateProductCost(
            item.product,
            productInfo.latestInvoicePrice
          );
          
          // Calculate price per unit
          const pricePerUnit = item.product.specialPriceUSD / (item.product.perBox > 0 ? item.product.perBox : 1);

          aggregatedItem.totalCost += costPerUnit * item.quantity;
          aggregatedItem.totalPrice += pricePerUnit * item.quantity;
          aggregatedItem.totalProfit += (pricePerUnit - costPerUnit) * item.quantity;
        }
      });

      let topProducts = Array.from(finalAggregatedProducts.values());

      // MANDATORY FILTER: Only include products NOT in pharmacy storage (i.e., disposable)
      topProducts = topProducts.filter(product => {
        const productInfo = bulkProductInfo[product.barcode];
        return productInfo && productInfo.isProductInPharmacyStorage === false;
      });

      // Sort by total quantity (descending)
      topProducts.sort((a, b) => b.totalQuantity - a.totalQuantity);

      return res.json(topProducts);
    } catch (e) {
      console.error("Error in /reports/top-products:", e);
      return res.status(500).json({ message: "An error occurred on the server while fetching top products." });
    }
  }
);

module.exports = router;