
const router = require("express").Router();
const mongoose = require("mongoose");
const Record = require("../models/Record");
const { requireAuth, allowRoles } = require("../middleware");

const permissions = {
  inventory: ["admin", "manager", "storekeeper"],
  purchases: ["admin", "manager"],
  usage: ["admin", "manager", "storekeeper"],
  wastage: ["admin", "manager", "storekeeper"],
  suppliers: ["admin", "manager"],
  closing: ["admin"],
  settings: ["admin"]
};

function validType(type) {
  return Object.prototype.hasOwnProperty.call(permissions, type);
}

router.use(requireAuth);

// GET records: /api/data/inventory
router.get("/:type", async (req, res) => {
  try {
    const { type } = req.params;
    if (!validType(type)) {
      return res.status(400).json({ message: "Invalid data type" });
    }
    if (!permissions[type].includes(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const records = await Record.find({ type }).sort({ createdAt: -1 });
    res.json(records);
  } catch {
    res.status(500).json({ message: "Could not load records" });
  }
});

// CREATE: POST /api/data/inventory
router.post("/:type", async (req, res) => {
  try {
    const { type } = req.params;
    if (!validType(type)) {
      return res.status(400).json({ message: "Invalid data type" });
    }
    if (!permissions[type].includes(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }
    if (req.body.data === undefined) {
      return res.status(400).json({ message: "data is required" });
    }

    const record = await Record.create({
      type,
      data: req.body.data,
      createdBy: req.user.id
    });
    res.status(201).json(record);
  } catch {
    res.status(500).json({ message: "Could not save record" });
  }
});

// UPDATE: PUT /api/data/inventory/:id
router.put("/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;
    if (!validType(type) || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid type or ID" });
    }
    if (!permissions[type].includes(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const record = await Record.findOneAndUpdate(
      { _id: id, type },
      { data: req.body.data },
      { new: true, runValidators: true }
    );
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.json(record);
  } catch {
    res.status(500).json({ message: "Could not update record" });
  }
});

// DELETE: DELETE /api/data/inventory/:id
router.delete("/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;
    if (!validType(type) || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid type or ID" });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can delete records"
      });
    }

    const record = await Record.findOneAndDelete({ _id: id, type });
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.json({ message: "Record deleted" });
  } catch {
    res.status(500).json({ message: "Could not delete record" });
  }
});

module.exports = router;
