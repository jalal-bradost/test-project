const {
  PatientCRM,
  PatientCRMStatus,
  PatientCRMCity,
  PatientCRMAddress,
  PatientCRMReferType,
  PatientCRMReferName,
  PatientCRMProfession,
} = require("../../../models");

module.exports = {
  // Create a new patient
  createPatient: async (req, res) => {
    try {
      const { referName, profession, address, ...patientData } = req.body;
  
      // Find or create Refer Name in PatientCRMReferName
      const [referNameRecord] = await PatientCRMReferName.findOrCreate({
        where: { name: referName },
        defaults: { name: referName }, // Adjust defaults if additional fields are required
      });
  
      // Find or create Profession in PatientCRMProfession
      const [professionRecord] = await PatientCRMProfession.findOrCreate({
        where: { name: profession },
        defaults: { name: profession }, // Adjust defaults if additional fields are required
      });
  
      // Find or create Address in PatientCRMAddress
      const [addressRecord] = await PatientCRMAddress.findOrCreate({
        where: { name: address },
        defaults: { name: address }, // Adjust defaults if additional fields are required
      });
  
      // Add the IDs to patient data
      patientData.referNameId = referNameRecord.referNameId;
      patientData.professionId = professionRecord.professionId;
      patientData.addressId = addressRecord.addressId;
  
      // Create the Patient record in PatientCRM
      const patient = await PatientCRM.create(patientData);
  
      res.status(201).json({ message: "Patient created successfully", patient });
    } catch (error) {
      console.error("Error creating patient:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all patients
  getAllPatients: async (req, res) => {
    try {
      // Fetching all patients with related data
      const patients = await PatientCRM.findAll({
        attributes: {
          exclude: [
            "cityId",
            "addressId",
            "referTypeId",
            "referNameId",
            "statusId",
            "professionId",
          ],
        },
        include: [
          { model: PatientCRMCity, as: "city", attributes: ["cityId", "name"] },
          { model: PatientCRMAddress, as: "address", attributes: ["addressId", "name"] },
          { model: PatientCRMReferType, as: "refer_type", attributes: ["referTypeId", "name"] },
          { model: PatientCRMReferName, as: "refer_name", attributes: ["referNameId", "name"] },
          { model: PatientCRMStatus, as: "status", attributes: ["statusId", "name"] },
          { model: PatientCRMProfession, as: "profession", attributes: ["professionId", "name"] },
        ],
      });
      res.status(200).json(patients);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get a single patient by ID
  getPatientById: async (req, res) => {
    try {
      const { id } = req.params;
      const patient = await PatientCRM.findByPk(id);

      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.status(200).json(patient);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update a patient by ID
  updatePatient: async (req, res) => {
    try {
      const {city, refer_name, refer_type,status,profession, address, ...patientData } = req.body;
      
      //set city id to patient
      patientData.cityId = city.cityId;

      //set refer type id to patient
      patientData.referTypeId = refer_type.referTypeId;

      //set status id to patient
      patientData.statusId = status.statusId;

      const referName = refer_name.name;
      const addressName = address.name;
      const professionName = profession.name;

      // Find or create Refer Name in PatientCRMReferName
      const [referNameRecord] = await PatientCRMReferName.findOrCreate({
        where: { name: referName },
      });
  
      // Find or create Profession in PatientCRMProfession
      const [professionRecord] = await PatientCRMProfession.findOrCreate({
        where: { name: professionName },
      });
  
      // Find or create Address in PatientCRMAddress
      const [addressRecord] = await PatientCRMAddress.findOrCreate({
        where: { name: addressName },
      });
  
      // Add the IDs to patient data
      patientData.referNameId = referNameRecord.referNameId;
      patientData.professionId = professionRecord.professionId;
      patientData.addressId = addressRecord.addressId;

      const { patientId } = req.body;
      const [updated] = await PatientCRM.update(patientData, {
        where: { patientId: patientId },
      });

      if (!updated) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const updatedPatient = await PatientCRM.findByPk(patientId);
      res
        .status(200)
        .json({ message: "Patient updated successfully", updatedPatient });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error.message });
    }
  },

  // Delete a patient by ID
  deletePatient: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await PatientCRM.destroy({
        where: { patientId: id },
      });

      if (!deleted) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.status(200).json({ message: "Patient deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
