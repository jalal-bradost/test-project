const {CrmActivityLog,PatientCRM,User, sequelize} = require("../../../models");

module.exports = {
  // get all activity logs by patientId
  getActivityLogsByPatientId: async (req, res) => {
    try {
      const { patientId } = req.params;

      // Fetch activity logs for the specified patientId
      const activityLogs = await CrmActivityLog.findAll({
        where: { patientId },
        order: [['createdAt', 'DESC']], // Order by createdAt in descending order
        include: [
          {
            model: PatientCRM, // Assuming PatientCRM is the model for patients
            attributes: ['fullname', 'patientId'], // Include necessary patient attributes
          },  
          {
            model: User,
            attributes: ['userId', 'name'], // Include user details who created the log
          }
        ],
      });

      res.status(200).json(activityLogs);
    } catch (error) {
      console.error("Error in getActivityLogsByPatientId:", error.message);
      res.status(500).json({ error: error.message });
    }
  },
}

