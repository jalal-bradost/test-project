const { FollowUpStage, PatientFollowUp, sequelize } = require("../../../models");
const moment = require("moment");

const getUpcomingFollowUps = async (req, res) => {
    try {
        const today = moment();
        const currentYear = today.year();

        const stages = await FollowUpStage.findAll({
            where: { called: false },
            attributes: [
              "followUpId",
              "patientId",
              "stageNumber",
              "followUpDate",
              "called",
              "calledDate",
              "isRecurring"
            ],
            include: [
              {
                model: PatientFollowUp,
                attributes: ["patientId", "fullname"],
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

            // Return if it's due soon OR it's uncalled and already passed
            return isDueSoon || isPast;
        });

        res.json(dueFollowUps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const markFollowUpCalled = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const stage = await FollowUpStage.findByPk(req.params.id, { transaction });

        if (!stage) {
            await transaction.rollback();
            return res.status(404).json({ message: "Follow-up not found" });
        }

        const isStageRecurring = stage.isRecurring;
        const { date } = req.body;

        // Use provided date or default to now
        const calledDate = date ? new Date(date) : new Date();

        // Update current stage
        stage.called = true;
        stage.calledDate = calledDate;
        stage.isRecurring = false;

        await stage.save({ transaction });

        // If recurring, create next year's follow-up
        if (isStageRecurring) {
            const nextFollowUpDate = moment(stage.followUpDate).add(1, "year").format("YYYY-MM-DD");

            await FollowUpStage.create({
                patientId: stage.patientId,
                stageNumber: stage.stageNumber + 1,
                followUpDate: nextFollowUpDate,
                isRecurring: true,
                called: false,
            }, { transaction });
        }

        await transaction.commit();
        res.json({ message: "Follow-up marked as called", stage });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

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
