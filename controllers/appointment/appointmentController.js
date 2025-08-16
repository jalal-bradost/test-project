const { Appointment, Doctor, Purpose, Patient,AppointmentData } = require("../../models");

module.exports = { 
  getAllAppointments: async (req, res) => {
    try {
      const appointments = await Appointment.findAll({
        order: [["createdAt", "DESC"]],
        include: [
          { model: Doctor, },
          { model: Purpose },
          { model: Patient },
        ],
      });
      res.status(200).json(appointments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

createAppointment: async (req, res) => {
    try {
      const {
        appointmentDateTime,
        note,
        faq,
        reasonWhy,
        compliant,
        isAttended,
        doctorId,
        purposeId,
        patientId,
      } = req.body;
      if (!appointmentDateTime || !doctorId || !purposeId || !patientId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newAppointment = await Appointment.create({
        appointmentDateTime,
        note,
        faq,
        reasonWhy,
        compliant,
        isAttended: isAttended || false,
        doctorId,
        purposeId,
        patientId,
      });

      res.status(201).json(newAppointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ error: error.message });
    }
  },
  updateAppointment: async (req, res) => {
  try {
    const { id } = req.params;

    const {
      appointmentDateTime,
      note,
      faq,
      reasonWhy,
      compliant,
      isAttended,
      doctorId,
      purposeId,
      patientId,
    } = req.body;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    await appointment.update({
      appointmentDateTime,
      note,
      faq,
      reasonWhy,
      compliant,
      isAttended,
      doctorId,
      purposeId,
      patientId,
    });

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ error: error.message });
  }
},
getAppointmentById: async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: Doctor },
        { model: Purpose },
        { model: Patient },
        { model:AppointmentData}
      ],
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment by ID:", error);
    res.status(500).json({ error: error.message });
  }
},

  deleteAppointment: async (req, res) => {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ message: "appointment not found" });
      }

      await appointment.destroy();
      res.status(200).json({ message: "appointment deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }, 
  
   
  allAppointmentPatient :async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [
        {
          model: Appointment,
          include: [
            { model: Doctor },  // include related doctor for each appointment
            { model: Purpose }, 
               { model:AppointmentData}
          ],
        },
      ],
    });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.status(200).json(patient);
  } catch (error) {
    console.error("Error fetching patient with appointments:", error);
    res.status(500).json({ error: error.message });
  }
},
updateAppointmentData: async (req, res) => {
  try {
     const { appointmentId, patientID } = req.params;
     const patientId = patientID; // normalize variable
 let { items, totalPrice } = req.body;
    // Find the appointment data
    let appointmentData = await AppointmentData.findOne({
      where: { appointmentId },
    });

    // If not found, create a new record
    if (!appointmentData) {
      appointmentData = await AppointmentData.create({
        appointmentId,
        patientId: 31,   // optional: include patientId if needed
        items: [], // start with empty array
        totalPrice: 0,
      });
    }

    // Add timestamp to new items
    items = items.map((item) => ({
      ...item,
      createdAt: new Date(),
    }));

    // Merge items and update total price
    appointmentData.items = [...(appointmentData.items || []), ...items];
    appointmentData.totalPrice += parseFloat(totalPrice);
    
    await appointmentData.save();

    res.json({ message: "Appointment data updated successfully", appointmentData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error occurred" });
  }
}

};
