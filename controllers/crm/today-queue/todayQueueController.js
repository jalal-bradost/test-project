const { AppointmentStage, PatientCRM, PatientCRMStatus, sequelize } = require("../../../models");
const { Op } = require("sequelize");

module.exports = {
  // Get all today's Appointment records
  getAllAppointments: async (req, res) => {
    try {
      

      // Query appointments that have appointmentDateTime within today
      const appointments = await AppointmentStage.findAll({
        include: {
          model: PatientCRM,
          where: { isActive: true },
          attributes: ['patientId', 'fullname', 'phoneNumber'],
          include: {
            model: PatientCRMStatus,
            as: 'status',
            attributes: ['name', 'statusId']
          }
        }
      });

      res.status(200).json(appointments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  getPatients: async (req, res) => {
    try {
      const patients = await AppointmentStage.getPatients();
      res.status(200).json(patients);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
};
