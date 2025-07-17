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
const { Op } = require("sequelize");

/**
 * @function getBulkProductInfo
 * @description Fetches `ProductStorage` and `ProductInvoice` data in bulk for a given set of barcodes.
 */
const getBulkProductInfo = async (barcodes) => {
  if (!barcodes || barcodes.length === 0) {
    return {};
  }

  const uniqueBarcodes = [...new Set(barcodes)];

  // Use Promise.all to run both queries in parallel
  const [productStorages, latestInvoices] = await Promise.all([
    // 1. Bulk query for ProductStorage
    ProductStorage.findAll({
      where: {
        barcode: { [Op.in]: uniqueBarcodes },
        storageId: 15,
      },
      attributes: ['barcode'],
      raw: true, // Get plain objects for better performance
    }),

    // 2. Bulk query for Latest ProductInvoice prices
    sequelize.query(
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
    )
  ]);

  // Create lookup maps
  const productStorageSet = new Set(productStorages.map(ps => ps.barcode));
  const latestInvoiceMap = new Map(latestInvoices.map(inv => [inv.barcode, inv.price]));

  // Combine results
  const result = {};
  uniqueBarcodes.forEach(barcode => {
    result[barcode] = {
      isProductInPharmacyStorage: productStorageSet.has(barcode),
      latestInvoicePrice: latestInvoiceMap.get(barcode) || 0,
    };
  });
  return result;
};

/**
 * @function calculateProductCost
 */
const calculateProductCost = (itemProduct, latestInvoicePrice) => {
  let productCost = 0;
  if (latestInvoicePrice > 0) {
    const { perBox } = itemProduct;
    productCost = perBox > 1 ? latestInvoicePrice / perBox : latestInvoicePrice;
  }
  
  const usageFactorMatch = itemProduct.name.trim().match(/x(\d+)$/);
  const usageFactor = usageFactorMatch ? parseInt(usageFactorMatch[1], 10) : 1;
  productCost = productCost / usageFactor;
  return productCost;
};

/**
 * @function processItemsWithDateFilter
 * @description Process items array and filter by date range efficiently
 * Handles null, undefined, and empty createdAt values properly
 */
const processItemsWithDateFilter = (items, startDate, endDate) => {
  if (!items || !Array.isArray(items)) return { items: [], barcodes: new Set() };
  
  const results = [];
  const barcodes = new Set();

  var count = 0;
  
  for (const item of items) {
    if (count++ === 0) {
      console.log(item);
    }
    if (!item?.barcode || !item?.product || item.quantity === undefined) continue;
    
    // Enhanced date filtering with null/empty handling
    if (startDate || endDate) {
      const itemCreatedAt = item.createdAt;
      
      // Skip items with null, undefined, or empty createdAt when date filtering is requested
      if (!itemCreatedAt || itemCreatedAt === '' || itemCreatedAt === null) {
        continue;
      }
      
      // Try to parse the date, skip if invalid
      const itemDate = new Date(itemCreatedAt);
      if (isNaN(itemDate.getTime())) {
        continue;
      }
      
      // Apply date range filtering
      if (startDate && itemDate < startDate) continue;
      if (endDate && itemDate > endDate) continue;
    }
    
    results.push({
      barcode: item.barcode,
      product: {
        id: item.product.productId,
        code: item.product.code,
        name: item.product.name,
        size: item.product.size,
        image: item.product.image,
        barcode: item.barcode,
        specialPriceUSD: item.product.specialPriceUSD,
        perBox: item.product.perBox,
        sourceCategory: item.product.sourceCategory,
      },
      quantity: item.quantity,
      createdAt: item.createdAt || "",
    });
    barcodes.add(item.barcode);
  }
  
  return { items: results, barcodes };
};

// =========================================================
// Report 2: Products Used for Patient Per Department
// Endpoint: GET /api/reports/patient-products
// Query Parameters:
//   - departmentType (optional): Filters by department type ("OP", "ICU", "SW").
//     If not provided, fetches data from all departments.
// =========================================================
router.get(
  "/reports/patient-products",
  [
    query("startDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Start date must be a valid ISO 8601 date."),
    query("endDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("End date must be a valid ISO 8601 date."),
  ],
  returnInCaseOfInvalidation,
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Normalize endDate to end of day
      let effectiveEndDate = endDate;
      if (effectiveEndDate) {
        effectiveEndDate = new Date(effectiveEndDate);
        effectiveEndDate.setHours(23, 59, 59, 999);
      }

      const allPatientsWithProducts = [];
      const allBarcodesAcrossAllPatients = new Set();

      // Hybrid approach: Filter at record level if possible, then filter items in JavaScript
      const buildDateWhereClause = () => {
        const where = {};
        // Only add record-level date filtering if we have dates
        // This will at least reduce some records, even if items need JS filtering
        if (startDate || effectiveEndDate) {
          where.createdAt = {};
          if (startDate) where.createdAt[Op.gte] = startDate;
          if (effectiveEndDate) where.createdAt[Op.lte] = effectiveEndDate;
        }
        return where;
      };

      // For better performance, let's also add a recent records filter
      // to avoid fetching very old records when we have date constraints
      const buildOptimizedWhereClause = () => {
        const where = {};
        if (startDate) {
          // If we have a start date, don't fetch records older than 30 days before it
          const bufferDate = new Date(startDate);
          bufferDate.setDate(bufferDate.getDate() - 30);
          where.createdAt = { [Op.gte]: bufferDate };
        } else if (effectiveEndDate) {
          // If we only have end date, don't fetch records older than 90 days before it
          const bufferDate = new Date(effectiveEndDate);
          bufferDate.setDate(bufferDate.getDate() - 90);
          where.createdAt = { [Op.gte]: bufferDate };
        }
        return where;
      };

      // Fetch all data in parallel with optimized queries
      const whereClause = buildOptimizedWhereClause();
      const [opDatas, icuDatas, swDatas] = await Promise.all([
        // OP Data with date filtering and minimal includes
        OPData.findAll({
          where: whereClause,
          attributes: ['opId', 'perfusionItems', 'anesthesiaItems', 'scrubNurseItems'],
          include: [
            { 
              model: Patient, 
              attributes: ['patientId', 'fullname', 'birthdate'],
              required: false 
            },
            { 
              model: OPOperationType, 
              attributes: ['name'],
              required: false 
            },
          ],
          raw: false, // Need nested objects for JSON fields
        }),

        // ICU Data
        ICUData.findAll({
          where: whereClause,
          attributes: ['icuId', 'items'],
          include: [
            { 
              model: Patient, 
              attributes: ['patientId', 'fullname', 'birthdate'],
              required: false 
            },
            { 
              model: ICUOperationType, 
              attributes: ['name'],
              required: false 
            },
          ],
          raw: false,
        }),

        // SW Data  
        SWData.findAll({
          where: whereClause,
          attributes: ['swId', 'items'],
          include: [
            { 
              model: Patient, 
              attributes: ['patientId', 'fullname', 'birthdate'],
              required: false 
            },
            { 
              model: SWOperationType, 
              attributes: ['name'],
              required: false 
            },
          ],
          raw: false,
        })
      ]);

      // Process OP Data
      for (const opData of opDatas) {
        const patientInfo = opData.Patient ? {
          id: opData.Patient.patientId,
          fullname: opData.Patient.fullname,
          birthdate: opData.Patient.birthdate,
        } : null;

        // Process each item type
        const itemTypes = [
          { items: opData.perfusionItems, department: 'PERFUSION' },
          { items: opData.anesthesiaItems, department: 'ANESTHESIA' },
          { items: opData.scrubNurseItems, department: 'SCRUB NURSE' }
        ];

        for (const { items, department } of itemTypes) {
          const processed = processItemsWithDateFilter(items, startDate, effectiveEndDate);
          if (processed.items.length > 0) {
            allPatientsWithProducts.push({
              recordId: opData.opId,
              recordType: 'OP',
              patient: patientInfo,
              department,
              departmentType: 'OP',
              products: processed.items,
            });
            processed.barcodes.forEach(barcode => allBarcodesAcrossAllPatients.add(barcode));
          }
        }
      }

      // Process ICU Data
      for (const icuData of icuDatas) {
        const recordDepartmentName = icuData.ICUOperationType?.name || 'ICU';
        const patientInfo = icuData.Patient ? {
          id: icuData.Patient.patientId,
          fullname: icuData.Patient.fullname,
          birthdate: icuData.Patient.birthdate,
        } : null;

        const processed = processItemsWithDateFilter(icuData.items, startDate, effectiveEndDate);
        if (processed.items.length > 0) {
          allPatientsWithProducts.push({
            recordId: icuData.icuId,
            recordType: 'ICU',
            patient: patientInfo,
            department: recordDepartmentName,
            departmentType: 'ICU',
            products: processed.items,
          });
          processed.barcodes.forEach(barcode => allBarcodesAcrossAllPatients.add(barcode));
        }
      }

      // Process SW Data
      for (const swData of swDatas) {
        const recordDepartmentName = swData.SWOperationType?.name || 'SURGICAL WARD';
        const patientInfo = swData.Patient ? {
          id: swData.Patient.patientId,
          fullname: swData.Patient.fullname,
          birthdate: swData.Patient.birthdate,
        } : null;

        const processed = processItemsWithDateFilter(swData.items, startDate, effectiveEndDate);
        if (processed.items.length > 0) {
          allPatientsWithProducts.push({
            recordId: swData.swId,
            recordType: 'SW',
            patient: patientInfo,
            department: recordDepartmentName,
            departmentType: 'SW',
            products: processed.items,
          });
          processed.barcodes.forEach(barcode => allBarcodesAcrossAllPatients.add(barcode));
        }
      }

      // Get bulk product info
      const bulkProductInfo = await getBulkProductInfo(Array.from(allBarcodesAcrossAllPatients));

      // Flatten data efficiently
      const flattenedData = [];
      var count =0;
      for (const record of allPatientsWithProducts) {
        for (const productItem of record.products) {
          const productInfoFromBulk = bulkProductInfo[productItem.barcode];
          
          // Skip products in pharmacy storage (disposable only)
          if (productInfoFromBulk?.isProductInPharmacyStorage) continue;
          
          const productCostPerUnit = productInfoFromBulk ? 
            calculateProductCost(productItem.product, productInfoFromBulk.latestInvoicePrice) : 0;
          const pricePerUnit = productItem.product.specialPriceUSD / 
            (productItem.product.perBox > 0 ? productItem.product.perBox : 1);

          const totalCost = productCostPerUnit * productItem.quantity;
          const totalPrice = pricePerUnit * productItem.quantity;
          const totalProfit = totalPrice - totalCost;
          if(count++ === 0){
            console.log(productItem)
          }

          flattenedData.push({
            recordId: record.recordId,
            recordType: record.recordType,
            patientId: record.patient?.id,
            patientFullname: record.patient?.fullname,
            patientBirthdate: record.patient?.birthdate,
            department: record.department,
            departmentType: record.departmentType,
            productBarcode: productItem.barcode,
            productCode: productItem.product?.code,
            productName: productItem.product?.name,
            productImage: productItem.product?.image,
            productSize: productItem.product?.size,
            productPerBox: productItem.product?.perBox,
            isProductInPharmacyStorage: false, // Already filtered out
            productCostPerUnit: Math.round(productCostPerUnit * 100) / 100,
            productPricePerUnit: Math.round(pricePerUnit * 100) / 100,
            totalQuantity: productItem.quantity,
            totalCost: Math.round(totalCost * 100) / 100,
            totalPrice: Math.round(totalPrice * 100) / 100,
            totalProfit: Math.round(totalProfit * 100) / 100,
            sourceCategory: productItem.product?.sourceCategory,
            itemCreatedAt: productItem.createdAt
          });
        }
      }

      return res.json(flattenedData);

    } catch (e) {
      console.error("Error in /reports/patient-products:", e);
      return res.status(500).json({ 
        message: "An error occurred on the server while fetching patient products.",
        error: process.env.NODE_ENV === 'development' ? e.message : undefined
      });
    }
  }
);

module.exports = router;