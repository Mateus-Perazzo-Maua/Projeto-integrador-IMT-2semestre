// database/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: String,
  email: String,
});

const User = mongoose.model('User', userSchema);

async function getUsers() {
  return await User.find({});
}

async function getUserById(id) {
  return await User.findById(id);
}

async function getUserByUsername(username) {
  return await User.findOne({ username });
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

module.exports = {
  getUsers,
  getUserById,
  getUserByUsername,
  addUser,
  updateUser,
  deleteUser,
};
