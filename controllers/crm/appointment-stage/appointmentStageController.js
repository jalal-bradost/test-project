const { AppointmentStage, PatientCRM, PatientCRMStatus,CrmActivityLog,sequelize } = require("../../../models");

module.exports = {
  // Create Appointment
  createAppointment: async (req, res) => {
    try {
      const createdBy = req.user.userId;
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

      // Retrieve and update PatientCRM record
      const patient = await PatientCRM.findByPk(patientId);
      if (!patient) {
        return res.status(404).json({
          message: "Patient record not found. Unable to proceed with DoctorStage creation.",
        });
      }

      var statusId= 4;

      // Update the statusId of the PatientCRM record
      await patient.update({ statusId });


      // Create Appointment
      const appointment = await AppointmentStage.create({
        patientId,
        ...appointmentData,
      });

      // Log the activity
      await CrmActivityLog.create({
        stage: "Appointment Created",
        createdBy,
        objectType: "Appointment",
        objectId: appointment.appointmentStageId,
        patientId: patientId,
        note: `Appointment created for patient ID: ${patientId}, name: ${patient.fullname}`,
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
  
    const transaction = await sequelize.transaction(); // Start transaction
    try {
      const { appointmentStageId, ...appointmentStageData } = req.body;
  
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
      // Log the activity
      const createdBy = req.user.userId;
      await CrmActivityLog.create({
        stage: "Appointment Updated",
        createdBy,
        objectType: "Appointment",
        objectId: appointmentStageId,
        patientId: patientId,
        note: `Appointment updated with ID: ${appointmentStageId}`,
      });
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

      //find patient name
      const appointment = await AppointmentStage.findByPk(id, {
        include: PatientCRM,
      });
      if (!appointment) {
        return res.status(404).json({ message: "Appointment record not found" });
      }

      // Log the activity
      const createdBy = req.user.userId;
      await CrmActivityLog.create({
        stage: "Appointment Deleted",
        createdBy,
        objectType: "Appointment",
        objectId: id,
        patientId: appointment.patientId,
        note: `Appointment deleted with ID: ${id}, patient name: ${appointment.PatientCRM.fullname}`,
      });

      res.status(200).json({ message: "Appointment record deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // marke appointment as attended
  markAppointmentAsAttended: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params; // Get appointmentStageId from URL parameters
      const createdBy = req.user.userId; // Get user ID from req.user

      // Find the appointment
      const appointment = await AppointmentStage.findByPk(id, { transaction });

      if (!appointment) {
        await transaction.rollback();
        return res.status(404).json({ message: "Appointment record not found" });
      }

      // Check if it's already attended to avoid unnecessary updates
      if (appointment.isAttended) {
        await transaction.rollback();
        return res.status(200).json({ message: "Appointment is already marked as attended" });
      }

      // Update the isAttended field
      const [updatedCount] = await AppointmentStage.update(
        { isAttended: true },
        { where: { appointmentStageId: id }, transaction }
      );

      if (updatedCount === 0) {
        await transaction.rollback();
        return res.status(404).json({ message: "Failed to mark appointment as attended" });
      }

      // Optionally, update PatientCRM status to reflect 'Attended' or 'Completed'
      // This depends on your business logic. For example, if statusId 5 means "Attended"
      // You'd need to know the correct statusId for 'Attended'.
      const patient = await PatientCRM.findByPk(appointment.patientId, { transaction });
      if (patient) {
        // Assuming statusId 5 is 'Attended' or 'Completed' in your PatientCRMStatus table
        // You might need to fetch this ID dynamically or hardcode if stable.
        const attendedStatusId = 5; // <--- IMPORTANT: Replace with the actual statusId for 'Attended' in your DB
        await patient.update({ statusId: attendedStatusId }, { transaction });
      }


      // Log the activity
      await CrmActivityLog.create({
        stage: "Appointment Attended",
        createdBy,
        objectType: "Appointment",
        objectId: id,
        patientId: patient.patientId,
        note: `Appointment ID: ${id} marked as attended by user ID: ${createdBy}`,
      }, { transaction });

      await transaction.commit();

      res.status(200).json({ message: "Appointment marked as attended successfully", appointmentId: id });

    } catch (error) {
      console.error("Error in markAppointmentAsAttended:", error);
      await transaction.rollback();
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  },
};
