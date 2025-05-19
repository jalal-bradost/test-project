const { FollowUpStage, PatientFollowUp, sequelize } = require("../../../models");
const moment = require("moment");

// Get all upcoming or overdue follow-ups
const getUpcomingFollowUps = async (req, res) => {
  try {
    const today = moment();
    const currentYear = today.year();

    const stages = await FollowUpStage.findAll({
      where: { status: "pending" },
      attributes: [
        "followUpId",
        "patientId",
        "stageNumber",
        "followUpDate",
        "status",
        "calledDate",
        "isRecurring"
      ],
      include: [
        {
          model: PatientFollowUp,
          attributes: ["patientId", "fullname", "mobile"],
        },
      ],
    });

    const dueFollowUps = stages.filter(stage => {
      const followUpDate = moment(stage.followUpDate);
      const followUpYear = followUpDate.year();

      const isPast = followUpDate.isBefore(today);

      const isDueSoon = (() => {
        if (followUpYear !== currentYear) return false;

        if (stage.isRecurring) {
          const [month, day] = followUpDate.format("MM-DD").split("-");
          const thisYearDate = moment(`${currentYear}-${month}-${day}`, "YYYY-MM-DD");
          return today.isSameOrAfter(thisYearDate.clone().subtract(2, "days"));
        } else {
          return today.isSameOrAfter(followUpDate.clone().subtract(2, "days"));
        }
      })();

      return isDueSoon || isPast;
    });

    res.json(dueFollowUps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark a follow-up with a given status (called, no_answer, deceased)
const markFollowUpCalled = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const stage = await FollowUpStage.findByPk(req.params.id, { transaction });

    if (!stage) {
      await transaction.rollback();
      return res.status(404).json({ message: "Follow-up not found" });
    }

    const isStageRecurring = stage.isRecurring;
    const { status = "called", date } = req.body;

    if (!["called", "no_answer", "deceased"].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid status value" });
    }

    const calledDate = date ? new Date(date) : new Date();

    // Update current stage
    stage.status = status;
    stage.calledDate = calledDate;
    stage.isRecurring = false;

    await stage.save({ transaction });

    // If stage is recurring and status is not "deceased", create next year's follow-up
    if (isStageRecurring && status !== "deceased") {
      const nextFollowUpDate = moment(stage.followUpDate).add(1, "year").format("YYYY-MM-DD");

      await FollowUpStage.create({
        patientId: stage.patientId,
        stageNumber: stage.stageNumber + 1,
        followUpDate: nextFollowUpDate,
        isRecurring: true,
        status: "pending",
      }, { transaction });
    }

    if (status === "deceased") {
        const patient = await PatientFollowUp.findByPk(stage.patientId, { transaction });
        if (patient) {
          patient.isPassed = true;
          await patient.save({ transaction });
        }
      }

    await transaction.commit();
    res.json({ message: `Follow-up marked as ${status}`, stage });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

// Fetch all follow-ups for a specific patient
const getFollowUpsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    const followUps = await FollowUpStage.findAll({
      include: [
        {
          model: PatientFollowUp,
          where: { patientId },
        },
      ],
      order: [["followUpDate", "ASC"]],
    });

    res.json(followUps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUpcomingFollowUps,
  markFollowUpCalled,
  getFollowUpsByPatientId
};
