const { SocialActivity, User, sequelize } = require("../../../models");
const { Sequelize, Op } = require('sequelize');

module.exports = {
  // Create a new SocialActivity record
  createSocialActivity: async (req, res) => {
    const createdBy = req.user.userId;
    const updatedBy = req.user.userId;
    try {
      const { ...socialActivityData } = req.body;

      // Create SocialActivity
      const socialActivity = await SocialActivity.create({
        ...socialActivityData,
        createdBy,
        updatedBy,
      });

      res.status(201).json({
        message: "SocialActivity record created successfully",
        socialActivity,
      });
    } catch (error) {
      console.error("Error in createSocialActivity:", error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all SocialActivity records
  getAllSocialActivities: async (req, res) => {
    try {
      const socialActivities = await SocialActivity.findAll({
        include: [
          {
            model: User, // Include the User model for the createdBy field
            attributes: ["name"], // Only include the fullname
            where: {
              userId: { [Op.eq]: Sequelize.col("SocialActivity.createdBy") }, // Corrected comparison
            },
          },
          {
            model: User, // Include the User model for the updatedBy field
            attributes: ["name"], // Only include the fullname
            where: {
              userId: { [Op.eq]: Sequelize.col("SocialActivity.updatedBy") }, // Corrected comparison
            },
          },
        ],
      });
      res.status(200).json(socialActivities);
    } catch (error) {
      console.error("Error in getAllSocialActivities:", error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Get patients related to SocialActivity
  getPatients: async (req, res) => {
    try {
      const patients = await SocialActivity.getPatients();
      res.status(200).json(patients);
    } catch (error) {
      console.error("Error in getPatients:", error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Get a single SocialActivity record by ID
  getSocialActivityById: async (req, res) => {
    try {
      const { id } = req.params;
      const socialActivity = await SocialActivity.findByPk(id);

      if (!socialActivity) {
        return res
          .status(404)
          .json({ message: "SocialActivity record not found" });
      }

      res.status(200).json(socialActivity);
    } catch (error) {
      console.error("Error in getSocialActivityById:", error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Update a SocialActivity record by ID
  updateSocialActivity: async (req, res) => {
    try {
      const id = req.body.socialActivityId;
      const [updated] = await SocialActivity.update(req.body, {
        where: { socialActivityId: id },
      });

      if (!updated) {
        return res
          .status(404)
          .json({ message: "SocialActivity record not found" });
      }

      const updatedSocialActivity = await SocialActivity.findByPk(id);
      res.status(200).json({
        message: "SocialActivity record updated successfully",
        updatedSocialActivity,
      });
    } catch (error) {
      console.error("Error in updateSocialActivity:", error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete a SocialActivity record by ID
  deleteSocialActivity: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await SocialActivity.destroy({
        where: { socialActivityId: id },
      });

      if (!deleted) {
        return res
          .status(404)
          .json({ message: "SocialActivity record not found" });
      }

      res
        .status(200)
        .json({ message: "SocialActivity record deleted successfully" });
    } catch (error) {
      console.error("Error in deleteSocialActivity:", error.message);
      res.status(500).json({ error: error.message });
    }
  },
};
