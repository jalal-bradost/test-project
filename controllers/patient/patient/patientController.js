const {
  Patient,ICUData,SWData,OPData
} = require("../../../models");
const { fn, col, literal } = require("sequelize");
module.exports = {
  // Create a new patient
 

  // Get all patients
//   getAllPatients: async (req, res) => {
//     try {
//       // Fetching all patients with related data
//       const patients = await Patient.findAll(
//       );
//       res.status(200).json(patients);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },
    getAllPatients: async (req, res) => {
    try {
      const patients = await Patient.findAll({
        
        attributes: {
            
          include: [
            [fn("COUNT", col("ICUData.icuId")), "icuCase"],
            [fn("COUNT", col("SWData.swId")), "swCase"],
            [fn("COUNT", col("OPData.opId")), "opCase"],
          ],
        },
        include: [
          {
            model: ICUData,
            attributes: [],
          },
           {
            model: SWData,
            attributes: [], // Only count, no full data
            required: false,
          },
           {
            model: OPData,
            attributes: [], // Only count, no full data
            required: false,
          },
        ],
        group: ["Patient.patientId"],
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json(patients);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
 },
getPatientById: async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [
        {
          model: ICUData,
           // include fields you want from ICUData
        },
        {
          model: SWData,
          // include fields you want from SWData
        },
        {
          model: OPData,
         // include fields you want from OPData
        },
      ],
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

  
};
