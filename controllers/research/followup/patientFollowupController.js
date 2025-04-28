const { PatientFollowUp, FollowUpStage, SurgeryTypeResearch, sequelize } = require("../../../models");
const moment = require("moment");
const multer = require('multer');
const xlsx = require('xlsx');


const getAllPatients = async (req, res) => {
  try {
    const patients = await PatientFollowUp.findAll({
      include: {
        model: SurgeryTypeResearch,
        attributes: ['name'], // Optional: limit fields
      },
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getPatientById = async (req, res) => {
  try {
    const patient = await PatientFollowUp.findByPk(req.params.id);
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ message: "Patient not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPatient = async (req, res) => {
  const {
    fullname,
    age,
    sex,
    surgeryTypeName,
    drName,
    patientCode,
    mobile,
    dateOfDischarge,
    isPassed
  } = req.body;

  const t = await sequelize.transaction();

  try {
    const surgeryType = await SurgeryTypeResearch.findOne({
      where: { name: surgeryTypeName },
      transaction: t,
    });

    if (!surgeryType) {
      await t.rollback();
      return res.status(400).json({ message: "Surgery type not found" });
    }

    const newPatient = await PatientFollowUp.create({
      fullname,
      age,
      sex,
      surgeryTypeId: surgeryType.surgeryTypeId,
      drName,
      patientCode,
      mobile,
      dateOfDischarge,
      isPassed,
    }, { transaction: t });

    await createFollowUps(newPatient.patientId, dateOfDischarge, t);

    await t.commit();
    res.status(201).json(newPatient);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};


const deletePatient = async (req, res) => {
  try {
    const result = await PatientFollowUp.destroy({ where: { patientId: req.params.id } });
    if (result) {
      res.json({ message: "Patient deleted successfully" });
    } else {
      res.status(404).json({ message: "Patient not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createFollowUps = async (patientId, dischargeDate, transaction) => {
  // Check if the discharge date is valid, if not, use January 1, 1970
  const base = moment(dischargeDate);

  const validDischargeDate = base.isValid() ? base : moment('1970-01-01'); // Use epoch date if the discharge date is invalid

  const stages = [
    { offset: 14, recurring: false },
    { offset: 14 + 30, recurring: false },
    { offset: 14 + 30 + 90, recurring: false },
    { offset: 14 + 30 + 90 + 180, recurring: false },
    { offset: 14 + 30 + 90 + 180 + 365, recurring: true },
  ];

  for (let i = 0; i < stages.length; i++) {
    // Calculate the follow-up date based on the discharge date or fallback
    const date = validDischargeDate.clone().add(stages[i].offset, "days").format("YYYY-MM-DD");

    // Create the follow-up stage using the valid date (or fallback)
    await FollowUpStage.create({
      patientId,
      stageNumber: i + 1,
      followUpDate: date,
      isRecurring: stages[i].recurring,
    }, { transaction });
  }
};



const importPatientsFromExcel = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const transaction = await sequelize.transaction();

  try {
    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    const createdPatients = [];

    for (const row of rows) {
      const {
        fullname,
        age,
        sex,
        surgeryTypeName,
        drName,
        patientCode,
        mobile,
        dateOfDischarge,
        isPassed,
      } = row;

      const normalizedSurgeryTypeName = (typeof surgeryTypeName === 'string' && surgeryTypeName.trim()) || "Unknown";

      const [surgeryType] = await SurgeryTypeResearch.findOrCreate({
        where: { name: normalizedSurgeryTypeName },
        defaults: { name: normalizedSurgeryTypeName },
        transaction,
      });

      const dateOfDischargeParsed = getValidDate(dateOfDischarge);

      const newPatient = await PatientFollowUp.create({
        fullname,
        age,
        sex,
        surgeryTypeId: surgeryType.surgeryTypeId,
        drName,
        patientCode,
        mobile,
        dateOfDischarge: dateOfDischargeParsed,
        isPassed: isPassed === "TRUE" || isPassed === true,
      }, { transaction });

      await createFollowUps(newPatient.patientId, dateOfDischargeParsed, transaction);
      createdPatients.push(newPatient);
    }

    await transaction.commit();
    res.status(201).json({ message: "Patients imported", patients: createdPatients });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: "Import failed", error: error.message });
  }
};

const getValidDate = (value) => {
  if (typeof value === 'number') {
    // Excel date serial
    return new Date(Math.round((value - 25569) * 86400 * 1000));
  }
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}; 


module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  deletePatient,
  importPatientsFromExcel,
};
