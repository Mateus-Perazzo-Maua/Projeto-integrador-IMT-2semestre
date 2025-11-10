const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  prompt: String,
  tema: String,
  tempoGeracao: Number, // segundos
  data: { type: Date, default: Date.now }
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
