// database/userModel.js
const mongoose = require("mongoose");

// Definição do schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

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
};
