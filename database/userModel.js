// database/userModel.js
const mongoose = require("mongoose");

// Definição do schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: {
    type: String,
    required: true,
    match: /@(sistemapoliedro\.com\.br|p4ed\.com)$/i
  },
  password: { type: String, required: true },
  history: [{
    imageUrl: String,
    prompt: String,
    materia: String,
    tema: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Aqui criamos e atribuimos o modelo à variável User
const User = mongoose.model("User", userSchema);

// Funções CRUD
async function getUsers() {
  return await User.find({});
}

async function getUserById(id) {
  return await User.findById(id);
}

async function getUserByUsername(username) {
  return await User.findOne({ username });
}

async function getUserByEmail(email) {
  return await User.findOne({ email });
}

async function addUser(userData) {
  const user = new User(userData);
  const savedUser = await user.save();
  return savedUser._id;
}

async function updateUser(id, updateData) {
  const result = await User.updateOne({ _id: id }, { $set: updateData });
  return result.modifiedCount;
}

async function deleteUser(id) {
  const result = await User.deleteOne({ _id: id });
  return result.deletedCount;
}

// Nova função para adicionar item ao histórico
async function addToHistory(email, imageData) {
  const result = await User.updateOne(
    { email },
    { 
      $push: { 
        history: {
          $each: [imageData],
          $position: 0, // Adiciona no início
          $slice: 50 // Mantém apenas os 50 mais recentes
        }
      }
    }
  );
  return result.modifiedCount;
}

// Nova função para obter histórico do usuário
async function getUserHistory(email) {
  const user = await User.findOne({ email }).select('history');
  return user ? user.history : [];
}

// Exporta tudo
module.exports = {
  User,
  getUsers,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  addUser,
  updateUser,
  deleteUser,
  addToHistory,
  getUserHistory
};