const {
    EmployeeWallet,
    Employee,
    Department,
    EmployeeRole,
    User,
    EmployeeWalletLog,
    SurgeryPricing, SurgeryCase, Patient, SurgeryType, EmployeeTask
} = require("../../models");

const include = [
    {
        model: Employee,
        as: "employee",
        include: [
            {
                model: User,
                as: "user",
            },
            {
                model: EmployeeRole,
                as: "role",
            },
            {
                model: Department,
                as: "department",
            },
            {
                model: SurgeryPricing,
                as: "pricings",
                include: [
                    {
                        model: SurgeryCase,
                        as: "surgeryCase",
                        include: [
                            {
                                model: Patient,
                                as: "patient"
                            },
                            {
                                model: SurgeryType,
                                as: "surgeryType"
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        model: EmployeeWalletLog,
        as: "logs",
    }
]


const getEmployeeWallets = async (req, res) => {
    try {
        const employeeWallets = await EmployeeWallet.findAll({include});
        return res.status(200).json(employeeWallets);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

const getEmployeeWallet = async (req, res) => {
    const employeeId = req.params.employeeId;
    try {
        const employeeWallet = await EmployeeWallet.findOne({where: {employeeId}, include});
        return res.status(200).json(employeeWallet);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

const getEmployeeSelfWallet = async (req, res) => {
    try {
        const user = req.user;
        if (!user?.employee) {
            return res.status(404).json({error: 'Employee not found'});
        }
        const employeeWallet = await EmployeeWallet.findOne({where: {employeeId: user.employee.employeeId}});
        const pricings = await SurgeryPricing.findAll({
            where: {employeeId: user.employee.employeeId}, include: {
                model: SurgeryCase,
                as: "surgeryCase",
                include: [
                    {
                        model: Patient,
                        as: "patient"
                    },
                    {
                        model: SurgeryType,
                        as: "surgeryType"
                    }
                ]
            }
        });
        return res.status(200).json({...employeeWallet, pricings});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
}


module.exports = {
    getEmployeeWallets,
    getEmployeeWallet,
    getEmployeeSelfWallet
}