const router = require("../../config/express");
const {
    body, param
} = require("express-validator");
const {Salary, Employee, sequelize, NetWorth} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");

router.post("/accountant/salary", [
    requirePermissions([permissionMap.accountant]),
    body("employeeId").isInt().custom(async employeeId => {
        const employee = await Employee.findByPk(employeeId)
        if (!employee) {
            throw Error("ئەم کارمەندە بوونی نییە")
        }
    }),
    body("baseSalary").isFloat({min: 0}),
    body("bonus").isFloat({min: 0}),
    body("date").isISO8601().toDate(),
    returnInCaseOfInvalidation
], async (req, res) => {
    try {
        await sequelize.transaction(async (t) => {
            const salary = await Salary.create(req.body, {transaction: t});
            await NetWorth.create({
                                      amount: -parseFloat(req.body.baseSalary) + -parseFloat(req.body.bonus),
                                      description: "Salary payment",
                                      salaryId: salary.salaryId,
                                      userId: req.user.userId
                                  },
                                  {transaction: t})
            return res.json(salary)
        });
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
});

// router.put("/accountant/salary/:salaryId", [
//     requirePermissions([permissionMap.accountant]),
//     param("salaryId").isInt().custom(async salaryId => {
//         const salary = await Salary.findByPk(salaryId)
//         if (!salary) {
//             throw Error("ئەم مووچەیە بوونی نییە")
//         }
//     }),
//     body("employeeId").isInt().custom(async employeeId => {
//         const employee = await Employee.findByPk(employeeId)
//         if (!employee) {
//             throw Error("ئەم کارمەندە بوونی نییە")
//         }
//     }),
//     body("baseSalary").isFloat({min: 0}),
//     body("bonus").isFloat({min: 0}),
//     body("date").isISO8601().toDate(),
//     returnInCaseOfInvalidation
// ], async (req, res) => {
//     try {
//         // const salary = await Salary.update(req.body, {where: {salaryId: req.params.salaryId}});
//         // return res.json(salary)
//         await sequelize.transaction(async (t) => {
//             const salaryDb = await Salary.findByPk(req.params.salaryId);
//             await NetWorth.create({
//                                       amount: parseFloat(req.body.baseSalary) + parseFloat(req.body.bonus) - parseFloat(
//                                           salaryDb.baseSalary) - parseFloat(salaryDb.bonus),
//                                       description: "Salary payment: edit"
//                                   },
//                                   {transaction: t})
//             const salary = await Salary.update(req.body, {where: {salaryId: req.params.salaryId}, transaction: t});
//             return res.json(salary)
//         });
//     } catch (e) {
//         console.log(e)
//         return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
//     }
// });

router.get("/accountant/salaries", [
    requirePermissions([permissionMap.accountant])
], async (req, res) => {
    try {
        const salary = await Salary.findAll({include: [{model: Employee}]});
        return res.json(salary.sort((a, b) => (a.salaryId < b.salaryId ? -1 : 1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
});

router.delete("/accountant/salary/:salaryId", [
    requirePermissions([permissionMap.accountant]),
    param("salaryId").isInt().custom(async salaryId => {
        const salary = await Salary.findByPk(salaryId)
        if (!salary) {
            throw Error("ئەم مووچەیە بوونی نییە")
        }
    }),
    returnInCaseOfInvalidation
], async (req, res) => {
    try {
        await Salary.destroy({where: {salaryId: req.params.salaryId}});
        return res.json({message: "بەسەرکەوتووی سڕایەوە"})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
});