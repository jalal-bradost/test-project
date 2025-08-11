const router = require("../../config/express");
const { body, param } = require("express-validator");
const {
  CardiologyData,
  ProductStorage,
  sequelize,
  Patient,
  CardiologyDataOperationTypeJunction,
  CardiologyOperationType,
  Product,
  ProductInvoice,
  PatientPayment,
} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");

// Create
router.post(
  "/cardiology/data",
  [
    body("patientId").isInt(),
    body("entryTime").optional().isISO8601().toDate(),
    body("exitTime").optional().isISO8601().toDate(),
    body("doctorId").optional().isInt(),
    body("cardiologyOperationTypes").isArray({ min: 1 }),
    returnInCaseOfInvalidation,
  ],
  async (req, res) => {
    console.log(req.body)
    const t = await sequelize.transaction(); // Start a new transaction
    const { patientId, entryTime, exitTime, doctorId } = req.body;
    try {
      const cardiologyData = await CardiologyData.create(
        { patientId, totalPrice: 0, entryTime, exitTime, doctorId, items: [] },
        { transaction: t }
      );
      for (const cardiologyOperationTypeId of req.body.cardiologyOperationTypes) {
        await CardiologyDataOperationTypeJunction.create(
          { cardiologyId: cardiologyData.cardiologyId, cardiologyOperationTypeId },
          { transaction: t }
        );
      }
      await t.commit();
      return res.json(cardiologyData);
    } catch (e) {
      await t.rollback();
      console.log(e);
      return res.status(500).json({ message: "هەڵەیەک ڕوویدا لە سێرڤەر" });
    }
  }
);

// Read
router.get(
  "/cardiology/data/:cardiologyId",
  param("cardiologyId").isInt(),
  returnInCaseOfInvalidation,
  async (req, res) => {
    try {
      const cardiologyData = await CardiologyData.findByPk(req.params.cardiologyId, {
        include: [{ model: Patient }, { model: CardiologyOperationType }],
      });
      if (!cardiologyData) {
        return res.status(400).json({ message: "بوونی نییە" });
      }
      return res.json(cardiologyData);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "هەڵەیەک ڕوویدا لە سێرڤەر" });
    }
  }
);

// Cache objects for query promises
const productStorageCache = new Map();
const latestInvoiceCache = new Map();

router.get("/cardiology/data", async (req, res) => {
  try {
    const cardiologyDatas = await CardiologyData.findAll({
      include: [{ model: Patient }, { model: CardiologyOperationType }, { model: PatientPayment }],
    });

    const filteredCardiologyData = await Promise.all(
      cardiologyDatas.map(async (model) => {
        const data = model.get({ plain: true });
        return {
          ...data,
          items: await cleanItems(data.items),
        };
      })
    );

    // Sort descending by cardiologyId
    return res.json(filteredCardiologyData.sort((a, b) => b.cardiologyId - a.cardiologyId));
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
        const usageFactor = usageFactorMatch ? parseInt(usageFactorMatch[1], 10) : 1;
        productCost = productCost / usageFactor;

        return {
          barcode,
          product: {
            code: item.product.code,
            name: item.product.name,
            size: item.product.size,
            image: item.product.image,
            barcode: item.product.barcode,
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


// Update
router.put(
  "/cardiology/data/:cardiologyId",
  [
    param("cardiologyId").isInt(),
    body("items").exists(),
    body("totalPrice").isFloat(),
    body("entryTime").optional().isISO8601().toDate(),
    body("exitTime").optional().isISO8601().toDate(),
    body("doctorId").optional().isInt(),
    returnInCaseOfInvalidation,
  ],
  async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { cardiologyId } = req.params;
      let { items, totalPrice } = req.body;

      const cardiologyData = await CardiologyData.findByPk(cardiologyId);
      if (!cardiologyData) {
        await t.rollback();
        return res.status(400).json({ message: "بوونی نییە" });
      }

      // Add createdAt timestamp to each item
      items = items.map((item) => ({
        ...item,
        createdAt: new Date(),
      }));

      cardiologyData.items = [...cardiologyData.items, ...items];
      cardiologyData.totalPrice += parseFloat(totalPrice);

      await cardiologyData.save({ transaction: t });

      // Loop through each item to adjust product storage
      for (const item of items) {
        const toProductStorage = await ProductStorage.findAll({
          where: {
            barcode: item.barcode,
            storageId: 29,
          },
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
      res.json({ message: "Cardiology data updated successfully" });
    } catch (e) {
      await t.rollback();
      console.log(e);
      res.status(500).json({ message: "Server error occurred" });
    }
  }
);

router.put(
  "/cardiology/data/:cardiologyId/details",
  [
    param("cardiologyId")
      .isInt()
      .custom(async (cardiologyId) => {
        const cardiologyData = await CardiologyData.findByPk(cardiologyId);
        if (!cardiologyData) {
          throw new Error("Cardiology data not found");
        }
      }),
    body("entryTime").optional().isISO8601().toDate(),
    body("doctorId").optional().isInt(),
    body("cardiologyOperationTypes").optional().isArray(),
    returnInCaseOfInvalidation,
  ],
  async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { cardiologyId } = req.params;
      const {
        entryTime,
        exitTime,
        doctorId,
        cardiologyOperationTypes,
        Patient: patient,
        patientId,
      } = req.body;
      const { fullname } = patient;
      await CardiologyData.update(
        { entryTime, exitTime, doctorId },
        { where: { cardiologyId }, transaction }
      );
      await Patient.update({ fullname }, { where: { patientId }, transaction });
      if (cardiologyOperationTypes) {
        await CardiologyDataOperationTypeJunction.destroy({
          where: { cardiologyId },
          transaction,
        });
        for (const cardiologyOperationTypeId of cardiologyOperationTypes) {
          await CardiologyDataOperationTypeJunction.create(
            { cardiologyId, cardiologyOperationTypeId },
            { transaction }
          );
        }
      }
      await transaction.commit();
      res.json({ message: "Cardiology data details has been updated successfully" });
    } catch (e) {
      console.log(e);
      await transaction.rollback();
      res.status(500).json({ message: "Server error occurred" });
    }
  }
);

router.delete(
  "/cardiology/data/:cardiologyId",
  param("cardiologyId").isInt(),
  returnInCaseOfInvalidation,
  async (req, res) => {
    try {
      const cardiologyData = await CardiologyData.findByPk(req.params.cardiologyId);
      if (!cardiologyData) {
        return res.status(400).json({ message: "بوونی نییە" });
      }
      await cardiologyData.destroy();
      return res.json({ message: "بەش سڕایەوە بە سەرکەوتوویی" });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "هەڵەیەک ڕوویدا لە سێرڤەر" });
    }
  }
);

router.post(
  "/cardiology/item-refund",
  requirePermissions([permissionMap.accountant]),
  body("cardiologyId").isInt(),
  body("quantity").isInt(),
  body("selectedProduct").exists(),
  returnInCaseOfInvalidation,
  async (req, res) => {
    const { selectedProduct, quantity, cardiologyId } = req.body;
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
        const cardiologyData = await CardiologyData.findByPk(cardiologyId);
        if (!cardiologyData) {
          return res.status(404).json({ message: "نەدۆزرایەوە" });
        }
        if (quantity > selectedProduct.quantity) {
          return res.status(400).json({ message: "بڕی پێویست بەردەست نییە" });
        } else if (quantity < selectedProduct.quantity) {
          await ProductStorage.increment(
            { quantity },
            {
              where: { barcode: selectedProduct.barcode, storageId: 29 },
              transaction: t,
            }
          );
          let done = false;
          const items = cardiologyData.items.map((item) => {
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
          await cardiologyData.update(
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
              where: { barcode: selectedProduct.barcode, storageId: 29 },
              transaction: t,
            }
          );
          const item = cardiologyData.items.find(
            (item) =>
              item.barcode === selectedProduct.barcode &&
              item.quantity === selectedProduct.quantity
          );
          const items = cardiologyData.items.filter((i) => i !== item);
          await cardiologyData.update(
            {
              totalPrice: sequelize.literal(
                `"totalPrice" - ${totalRefundedPrice}`
              ),
              items,
            },
            { transaction: t }
          );
        }
        await cardiologyData.save({ transaction: t });
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
  "/cardiology/merge",
  requirePermissions([permissionMap.accountant]),
  body("cardiologyCases").isArray({ min: 2 }),
  body("cardiologyCases.*.cardiologyId")
    .isInt()
    .custom(async (cardiologyId) => {
      const cardiologyData = await CardiologyData.findByPk(cardiologyId);
      if (!cardiologyData) {
        throw new Error("Cardiology data not found");
      }
    }),
  returnInCaseOfInvalidation,
  async (req, res) => {
    const { cardiologyCases } = req.body;
    try {
      const result = await sequelize.transaction(async (t) => {
        const cardiologyDatas = await CardiologyData.findAll({
          where: { cardiologyId: cardiologyCases.map((cardiology) => cardiology.cardiologyId) },
          include: [{ model: CardiologyOperationType }],
          transaction: t,
        });
        // check if they are from the same patient
        const patientIds = cardiologyDatas.map((cardiology) => cardiology.patientId);
        if (new Set(patientIds).size !== 1) {
          return res
            .status(400)
            .json({ message: "Cases should be from the same patient" });
        }
        const totalPrice = cardiologyDatas.reduce(
          (acc, current) => acc + current.totalPrice,
          0
        );
        const items = cardiologyDatas.reduce(
          (acc, current) => [...acc, ...current.items],
          []
        );
        const mergedCardiology = await CardiologyData.create(
          {
            patientId: cardiologyDatas[0].patientId,
            totalPrice,
            entryTime: cardiologyDatas[0].entryTime,
            exitTime: cardiologyDatas[0].exitTime,
            doctorId: cardiologyDatas[0].doctorId,
            items,
          },
          { transaction: t }
        );
        const uniqueOperationTypes = new Set(
          cardiologyDatas
            .map((cardiology) =>
              cardiology.CardiologyOperationTypes.map(
                (cardiologyOperationType) => cardiologyOperationType.cardiologyOperationTypeId
              )
            )
            .flat()
        );
        await CardiologyDataOperationTypeJunction.bulkCreate(
          Array.from(uniqueOperationTypes).map((opTypeId) => ({
            cardiologyId: mergedCardiology.cardiologyId,
            cardiologyOperationTypeId: opTypeId,
          })),
          { transaction: t }
        );
        await CardiologyData.destroy({
          where: { cardiologyId: cardiologyCases.map((cardiology) => cardiology.cardiologyId) },
          transaction: t,
        });
        return res.json({ message: "Cardiology Cases has been merged successfully" });
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "هەڵەیەک ڕوویدا لە سێرڤەر" });
    }
  }
);

module.exports = router;
