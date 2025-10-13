// database/userModel.js
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('./connection');

async function getUsers() {
  const db = await connectToDatabase();
  const collection = db.collection('users');
  return collection.find({}).toArray();
}

async function getUserById(id) {
  const db = await connectToDatabase();
  const collection = db.collection('users');
  return collection.findOne({ _id: new ObjectId(id) });
}

async function getUserByUsername(username) {
  const db = await connectToDatabase();
  const collection = db.collection('users');
  return collection.findOne({ username });
}

async function addUser(userData) {
  const db = await connectToDatabase();
  const collection = db.collection('users');
  const result = await collection.insertOne(userData);
  return result.insertedId;
}

async function updateUser(id, updateData) {
  const db = await connectToDatabase();
  const collection = db.collection('users');
  const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
  return result.modifiedCount;
}

async function deleteUser(id) {
  const db = await connectToDatabase();
  const collection = db.collection('users');
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
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
