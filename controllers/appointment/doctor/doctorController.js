const { Doctor} = require("../../../models");

module.exports = { 
 getAllDoctors: async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},

 createDoctor: async (req, res) => {
    try {
      const { fullName, level, fee } = req.body;

      // Validation
      if (!fullName || !level) {
        return res.status(400).json({ error: "Full name and level are required" });
      }

      // Create doctor
      const doctor = await Doctor.create({
        fullName,
        level,
        fee: fee || 0, 
      });

      res.status(201).json({
        message: "Doctor created successfully",
        doctor,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  deleteDoctor: async (req, res) => {
    try {
      const { id } = req.params;

      const doctor = await Doctor.findByPk(id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      await doctor.destroy();
      res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }, 
    updateDoctor: async (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, level, fee } = req.body;

      const doctor = await Doctor.findByPk(id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      // Optional: validate required fields here

      await doctor.update({ fullName, level, fee });

      res.status(200).json({
        message: "Doctor updated successfully",
        doctor,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }, 
};
