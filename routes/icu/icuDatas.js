const router = require("../../config/express");
const { body, param } = require("express-validator");
const {
  ICUData,
  sequelize,
  ProductStorage,
  Patient,
  ICUDataOperationTypeJunction,
  Product,
  ICUOperationType,
  OPDataOperationTypeJunction,
  SWData,
  SWOperationType,
  PatientPayment,
  ProductInvoice,
} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");

router.post(
  "/icu/data",
  [
    body("patientId").isInt(),
    body("staffs").exists(),
    body("entryTime").optional().isISO8601().toDate(),
    body("exitTime").optional().isISO8601().toDate(),
    body("doctorId").optional().isInt(),
    body("icuOperationTypes").isArray({ min: 1 }),
    returnInCaseOfInvalidation,
  ],
  async (req, res) => {
    const t = await sequelize.transaction(); // Start a new transaction
    const { patientId, staffs, entryTime, exitTime, doctorId } = req.body;
    try {
      const icuData = await ICUData.create(
        {
          patientId,
          totalPrice: 0,
          staffs,
          entryTime,
          exitTime,
          doctorId,
          items: [],
        },
        { transaction: t }
      );
      for (const icuOperationTypeId of req.body.icuOperationTypes) {
        await ICUDataOperationTypeJunction.create(
          { icuId: icuData.icuId, icuOperationTypeId },
          { transaction: t }
        );
      }
      await t.commit();
      return res.json(icuData);
    } catch (e) {
      await t.rollback();
      console.log(e);
      return res.status(500).json({ message: "هەڵەیەک ڕوویدا لە سێرڤەر" });
    }
  }
);

router.get(
  "/icu/data/:icuId",
  param("icuId").isInt(),
  returnInCaseOfInvalidation,
  async (req, res) => {
    try {
      const icuData = await ICUData.findByPk(req.params.icuId, {
        include: [{ model: Patient }, { model: ICUOperationType }],
      });
      if (!icuData) {
        return res.status(400).json({ message: "بوونی نییە" });
      }
      return res.json(icuData);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "هەڵەیەک ڕوویدا لە سێرڤەر" });
    }
  }
);

// Cache objects for query promises
const productStorageCache = new Map();
const latestInvoiceCache = new Map();

router.get("/icu/data", async (req, res) => {
  try {
    const icuDatas = await ICUData.findAll({
      include: [
        { model: Patient },
        { model: ICUOperationType },
        { model: PatientPayment },
      ],
    });

    const filteredIcuData = await Promise.all(
      icuDatas.map(async (model) => {
        const data = model.get({ plain: true });
        return {
          ...data,
          items: await cleanItems(data.items),
        };
      })
    );

    // Sort descending by icuId
    return res.json(filteredIcuData.sort((a, b) => b.icuId - a.icuId));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "هەڵەیەک ڕوویدا لە سێرڤەر" });
  }
});

const cleanItems = async (items) => {
  return Promise.all(
    items.map(async (item) => {
      try {
        const barcode = item.barcode;

        // Cache query for ProductStorage
        if (!productStorageCache.has(barcode)) {
          productStorageCache.set(
            barcode,
            ProductStorage.findOne({
              where: { barcode, storageId: 15 },
            })
          );
        }

        // Cache query for Latest Invoice
        if (!latestInvoiceCache.has(barcode)) {
          latestInvoiceCache.set(
            barcode,
            ProductInvoice.findOne({
              where: { barcode },
              order: [["createdAt"]],
            })
          );
        }

        // Run both queries concurrently
        const [productInStorage, latestInvoice] = await Promise.all([
          productStorageCache.get(barcode),
          latestInvoiceCache.get(barcode),
        ]);

        let productCost = 0;
        if (latestInvoice) {
          const { price } = latestInvoice.dataValues;
          const { perBox } = item.product;
          productCost = perBox > 1 ? price / perBox : price;
        }
        const usageFactorMatch = item.product.name.trim().match(/x(\d+)$/);
        const usageFactor = usageFactorMatch
          ? parseInt(usageFactorMatch[1], 10)
          : 1;
        productCost = productCost / usageFactor;

        return {
          barcode,
          product: {
            id: item.product.code,
            name: item.product.name,
            size: item.product.size,
            image: item.product.image,
            specialPriceUSD: item.product.specialPriceUSD,
            perBox: item.product.perBox,
            isProductInPharmacyStorage: Boolean(productInStorage),
            productCost,
          },
          quantity: item.quantity,
          createdAt: item.createdAt? item.createdAt:""
        };
      } catch (err) {
        console.error("Error processing item:", item.barcode, err);
        return null;
      }
    })
  ).then((results) => results.filter((item) => item !== null)); // Filter out failed items
};

router.put(
  "/icu/data/:icuId",
  [
    param("icuId").isInt(),
    body("items").exists(),
    body("totalPrice").isFloat(),
    body("items.*.quantity").isInt(),
    body("items.*.barcode")
      .isString()
      .custom(async (barcode) => {
        const product = await Product.findOne({ where: { barcode } });
        if (!product) {
          throw new Error("Product not found");
        }
      }),
    returnInCaseOfInvalidation,
  ],
  async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { icuId } = req.params;
      let { items, totalPrice } = req.body;

      const icuData = await ICUData.findByPk(icuId);
      if (!icuData) {
        await t.rollback();
        return res.status(400).json({ message: "بوونی نییە" });
      }

      // Add createdAt timestamp to each item
      items = items.map((item) => ({
        ...item,
        createdAt: new Date(),
      }));

      icuData.items = [...icuData.items, ...items];
      icuData.totalPrice += parseFloat(totalPrice);

      await icuData.save({ transaction: t });

      // Loop through each item to adjust product storage
      for (const item of items) {
        const toProductStorage = await ProductStorage.findAll({
          where: { barcode: item.barcode, storageId: 7 },
        });

        if (toProductStorage.length === 0) {
          await t.rollback();
          return res
            .status(404)
            .json({ message: "Product not found in destination storage" });
        }

        let quantity = item.quantity;
        const totalAvailableQuantity = toProductStorage.reduce(
          (acc, current) => acc + current.quantity,
          0
        );
        if (totalAvailableQuantity < quantity) {
          await t.rollback();
          return res
            .status(400)
            .json({ message: "Not enough quantity in destination storage" });
        }

        for (const toStorage of toProductStorage) {
          if (toStorage.quantity >= quantity) {
            await ProductStorage.update(
              { quantity: sequelize.literal(`quantity - ${quantity}`) },
              {
                where: { productStorageId: toStorage.productStorageId },
                transaction: t,
              }
            );
            break;
          } else {
            await ProductStorage.update(
              {
                quantity: sequelize.literal(`quantity - ${toStorage.quantity}`),
              },
              {
                where: { productStorageId: toStorage.productStorageId },
                transaction: t,
              }
            );
            quantity -= toStorage.quantity;
          }
        }
      }

      // Commit the transaction
      await t.commit();
      res.json({ message: "ICU data updated successfully" });
    } catch (e) {
      await t.rollback();
      console.log(e);
      res.status(500).json({ message: "Server error occurred" });
    }
  }
);

router.put(
  "/icu/data/:icuId/details",
  [
    param("icuId")
      .isInt()
      .custom(async (icuId) => {
        const icuData = await ICUData.findByPk(icuId);
        if (!icuData) {
          throw new Error("ICU data not found");
        }
      }),
    body("staffs").isArray(),
    body("entryTime").optional().isISO8601().toDate(),
    body("doctorId").optional().isInt(),
    body("icuOperationTypes").optional().isArray(),
    returnInCaseOfInvalidation,
  ],
  async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { icuId } = req.params;
      const { staffs, entryTime, exitTime, doctorId, icuOperationTypes } =
        req.body;
      await ICUData.update(
        { staffs, entryTime, exitTime, doctorId },
        { where: { icuId }, transaction }
      );
      if (icuOperationTypes) {
        await ICUDataOperationTypeJunction.destroy({
          where: { icuId },
          transaction,
        });
        for (const icuOperationTypeId of icuOperationTypes) {
          await ICUDataOperationTypeJunction.create(
            { icuId, icuOperationTypeId },
            { transaction }
          );
        }
      }
      await transaction.commit();
      res.json({ message: "ICU data details has been updated successfully" });
    } catch (e) {
      console.log(e);
      await transaction.rollback();
      res.status(500).json({ message: "Server error occurred" });
    }
  }
);

// Delete
router.delete(
  "/icu/data/:icuId",
  param("icuId").isInt(),
  returnInCaseOfInvalidation,
  async (req, res) => {
    try {
      const icuData = await ICUData.findByPk(req.params.icuId);
      if (!icuData) {
        return res.status(400).json({ message: "بوونی نییە" });
      }
      // await icuData.destroy();
      return res.json({ message: "سڕایەوە بە سەرکەوتوویی" });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "هەڵەیەک ڕوویدا لە سێرڤەر" });
    }
  }
);

router.post(
  "/icu/item-refund",
  requirePermissions([permissionMap.accountant]),
  body("icuId").isInt(),
  body("quantity").isInt(),
  body("selectedProduct").exists(),
  returnInCaseOfInvalidation,
  async (req, res) => {
    const { selectedProduct, quantity, icuId } = req.body;
    try {
      const result = await sequelize.transaction(async (t) => {
        const product = await Product.findOne({
          where: { barcode: selectedProduct.barcode },
        });
        if (!product) {
          return res.status(404).json({ message: "نەدۆزرایەوە" });
        }
        const totalRefundedPrice =
          quantity *
          (selectedProduct.product.specialPriceUSD /
            (selectedProduct.product.perBox > 1
              ? selectedProduct.product.perBox
              : 1));
        const icuData = await ICUData.findByPk(icuId);
        if (!icuData) {
          return res.status(404).json({ message: "نەدۆزرایەوە" });
        }
        if (quantity > selectedProduct.quantity) {
          return res.status(400).json({ message: "بڕی پێویست بەردەست نییە" });
        } else if (quantity < selectedProduct.quantity) {
          await ProductStorage.increment(
            { quantity },
            {
              where: { barcode: selectedProduct.barcode, storageId: 7 },
              transaction: t,
            }
          );
          let done = false;
          const items = icuData.items.map((item) => {
            if (
              item.barcode === selectedProduct.barcode &&
              item.quantity === selectedProduct.quantity &&
              !done
            ) {
              done = true;
              return {
                ...item,
                quantity: item.quantity - quantity,
              };
            }
            return item;
          });
          await icuData.update(
            {
              totalPrice: sequelize.literal(
                `"totalPrice" - ${totalRefundedPrice}`
              ),
              items,
            },
            { transaction: t }
          );
        } else {
          await ProductStorage.increment(
            { quantity },
            {
              where: { barcode: selectedProduct.barcode, storageId: 7 },
              transaction: t,
            }
          );
          const item = icuData.items.find(
            (item) =>
              item.barcode === selectedProduct.barcode &&
              item.quantity === selectedProduct.quantity
          );
          const items = icuData.items.filter((i) => i !== item);
          await icuData.update(
            {
              totalPrice: sequelize.literal(
                `"totalPrice" - ${totalRefundedPrice}`
              ),
              items,
            },
            { transaction: t }
          );
        }
        await icuData.save({ transaction: t });
        return res.json({
          message: "داواکاری گەڕاندنەوە بە سەرکەوتوویی تەواوبوو",
        });
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "هەڵەیەک ڕوویدا لە سێرڤەر" });
    }
  }
);

router.post(
  "/icu/merge",
  requirePermissions([permissionMap.accountant]),
  body("icuCases").isArray({ min: 2 }),
  body("icuCases.*.icuId")
    .isInt()
    .custom(async (icuId) => {
      const icuData = await ICUData.findByPk(icuId);
      if (!icuData) {
        throw new Error("ICU data not found");
      }
    }),
  returnInCaseOfInvalidation,
  async (req, res) => {
    const { icuCases } = req.body;
    try {
      const result = await sequelize.transaction(async (t) => {
        const icuDatas = await ICUData.findAll({
          where: { icuId: icuCases.map((icu) => icu.icuId) },
          include: [{ model: ICUOperationType }],
          transaction: t,
        });
        // check if they are from the same patient
        const patientIds = icuDatas.map((icu) => icu.patientId);
        if (new Set(patientIds).size !== 1) {
          return res
            .status(400)
            .json({ message: "Cases should be from the same patient" });
        }
        const totalPrice = icuDatas.reduce(
          (acc, current) => acc + current.totalPrice,
          0
        );
        const items = icuDatas.reduce(
          (acc, current) => [...acc, ...current.items],
          []
        );
        const mergedIcu = await ICUData.create(
          {
            patientId: icuDatas[0].patientId,
            totalPrice,
            staffs: icuDatas[0].staffs,
            entryTime: icuDatas[0].entryTime,
            exitTime: icuDatas[0].exitTime,
            doctorId: icuDatas[0].doctorId,
            items,
          },
          { transaction: t }
        );
        const uniqueOperationTypes = new Set(
          icuDatas
            .map((icu) =>
              icu.ICUOperationTypes.map(
                (icuOperationType) => icuOperationType.icuOperationTypeId
              )
            )
            .flat()
        );
        await ICUDataOperationTypeJunction.bulkCreate(
          Array.from(uniqueOperationTypes).map((opTypeId) => ({
            icuId: mergedIcu.icuId,
            icuOperationTypeId: opTypeId,
          })),
          { transaction: t }
        );
        await ICUData.destroy({
          where: { icuId: icuCases.map((icu) => icu.icuId) },
          transaction: t,
        });
        return res.json({ message: "ICU Cases has been merged successfully" });
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "هەڵەیەک ڕوویدا لە سێرڤەر" });
    }
  }
);

module.exports = router;
