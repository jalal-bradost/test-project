const { AppointmentStage, PatientCRM, PatientCRMStatus } = require("../../../models");

module.exports = {
  // Create Appointment
  createAppointment: async (req, res) => {
    try {
      const { patientId, ...appointmentData } = req.body;
  
      // Check if the patient is already scheduled
      // const existingAppointment = await AppointmentStage.findOne({
      //   where: { patientId },
      // });
  
      // if (existingAppointment) {
      //   return res.status(400).json({
      //     message: "Patient is already scheduled for an appointment.",
      //   });
      // }
  
      // Create Appointment
      const appointment = await AppointmentStage.create({
        patientId,
        ...appointmentData,
      });
  
      res.status(201).json({
        message: "Appointment record created successfully",
        appointment,
      });
    } catch (error) {
      console.error("Error in createAppointment:", error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all Appointment records
  getAllAppointments: async (req, res) => {
    // console.log(req.user.userId)
    try {
      const appointments = await AppointmentStage.findAll({
        include: {
          model: PatientCRM,
          include:{
            model: PatientCRMStatus,
            attributes: ['name',],  
            as:'status'
          },
          attributes: ['patientId', 'fullname', 'phoneNumber'],  
        },
      }); 
      res.status(200).json(appointments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  getPatients: async(req,res) =>{
    try {
      const patients = await AppointmentStage.getPatients();
      res.status(200).json(patients);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error.message });
    }
  },

  // Get a single Appointment record by ID
  getAppointmentById: async (req, res) => {
    try {
      const { id } = req.params;
      const appointment = await AppointmentStage.findByPk(id, {
        include: {
          model: PatientCRM,
          attributes: ['patientId', 'fullname', 'phoneNumber'],  
        },
      });

      if (!appointment) {
        return res.status(404).json({ message: "Appointment record not found" });
      }

      res.status(200).json(appointment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update an Appointment record by ID
  updateAppointment: async (req, res) => {
    try {
      const id = req.body.appointmentId; // Ensure the correct field name is used for ID
      const [updated] = await AppointmentStage.update(req.body, {
        where: { appointmentId: id }, // Match by the new field name "appointmentId"
      });

      if (!updated) {
        return res.status(404).json({ message: "Appointment record not found" });
      }

      const updatedAppointment = await AppointmentStage.findByPk(id);
      res.status(200).json({
        message: "Appointment record updated successfully",
        updatedAppointment,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete an Appointment record by ID
  deleteAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await AppointmentStage.destroy({
        where: { appointmentStageId: id }, // Match by the new field name "appointmentId"
      });

      if (!deleted) {
        return res.status(404).json({ message: "Appointment record not found" });
      }

      res.status(200).json({ message: "Appointment record deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
