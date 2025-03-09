const { AppointmentStage, PatientCRM, PatientCRMStatus,sequelize } = require("../../../models");

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
      console.log(appointmentData.purpose)
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
            attributes: ['name','statusId'],  
            as:'status'
          },
          where: { isActive: true },
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
  // updateAppointment: async (req, res) => {
  //   try {
  //     const id = req.body.appointmentId; // Ensure the correct field name is used for ID
  //     const [updated] = await AppointmentStage.update(req.body, {
  //       where: { appointmentId: id }, // Match by the new field name "appointmentId"
  //     });

  //     if (!updated) {
  //       return res.status(404).json({ message: "Appointment record not found" });
  //     }

  //     const updatedAppointment = await AppointmentStage.findByPk(id);
  //     res.status(200).json({
  //       message: "Appointment record updated successfully",
  //       updatedAppointment,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ error: error.message });
  //   }
  // },
  updateAppointment: async (req, res) => {
    // Update a FirstStage record by ID
  
    console.log(req.body);
    const transaction = await sequelize.transaction(); // Start transaction
    try {
      const { appointmentStageId, ...appointmentStageData } = req.body;
      console.log(appointmentStageId)
  
      // Validate and update PatientCRM status if provided
      if (appointmentStageData.PatientCRM && appointmentStageData.PatientCRM.status) {
        const { statusId } = appointmentStageData.PatientCRM.status;
  
        // Retrieve the associated PatientCRM from the FirstStage
        const firstStage = await AppointmentStage.findByPk(appointmentStageId, {
          include: [{ model: PatientCRM, as: "PatientCRM" }],
          transaction,
        });
  
        if (!firstStage || !firstStage.PatientCRM) {
          await transaction.rollback();
          return res
            .status(404)
            .json({ message: "Associated PatientCRM record not found." });
        }
  
        // Update PatientCRM status
        const patientCRMUpdateResult = await PatientCRM.update(
          { statusId },
          { where: { patientId: firstStage.PatientCRM.patientId }, transaction }
        );
  
        if (!patientCRMUpdateResult[0]) {
          await transaction.rollback();
          return res
            .status(404)
            .json({
              message: "PatientCRM record not found for the given patientId.",
            });
        }
      }
  
      // Update the FirstStage record with the new data
      const [updated] = await AppointmentStage.update(appointmentStageData, {
        where: { appointmentStageId },
        transaction,
      });
  
      if (!updated) {
        await transaction.rollback();
        return res
          .status(404)
          .json({ message: "FirstStage record not found." });
      }
  
      // Fetch the updated FirstStage record
      // const updatedFirstStage = await FirstStage.findByPk(firstStageId, {
      //   include: [{ model: PatientCRM, as: "PatientCRM" }],
      //   transaction,
      // });
  
      await transaction.commit();
      res.status(200).json({
        message: "FirstStage updated successfully.",
        // firstStage: updatedFirstStage,
      });
    } catch (error) {
      console.error(error);
      await transaction.rollback();
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
