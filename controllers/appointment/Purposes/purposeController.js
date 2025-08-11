const { Purpose} = require("../../../models");

module.exports = { 
 getAllPurpose: async (req, res) => {
  try {
    const purpose = await Purpose.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(purpose);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},
getPurposeById: async (req, res) => {
    try {
      const { id } = req.params;
      const purpose = await Purpose.findByPk(id);
      if (!purpose) return res.status(404).json({ error: "Purpose not found" });
      res.status(200).json(purpose);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },


  createPurpose: async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required" });

      const newPurpose = await Purpose.create({ text });
      res.status(201).json(newPurpose);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },


  updatePurpose: async (req, res) => {
    try {
      const { id } = req.params;
      const { text } = req.body;

      const purpose = await Purpose.findByPk(id);
      if (!purpose) return res.status(404).json({ error: "Purpose not found" });

      if (text) purpose.text = text;

      await purpose.save();
      res.status(200).json(purpose);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deletePurpose: async (req, res) => {
    try {
      const { id } = req.params;
      const purpose = await Purpose.findByPk(id);
      if (!purpose) return res.status(404).json({ error: "Purpose not found" });

      await purpose.destroy();
      res.status(200).json({ message: "appointment deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

