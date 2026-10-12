
const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "inventory",
        "purchases",
        "usage",
        "wastage",
        "suppliers",
        "closing",
        "settings"
      ]
    },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Record", recordSchema);
