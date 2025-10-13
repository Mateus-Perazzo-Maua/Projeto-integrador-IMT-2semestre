// database/connection.js

const { MongoClient } = require('mongodb');

// URL de conexão do MongoDB (mude para a sua URL)
const uri = 'mongodb://localhost:27017';

// Nome do banco de dados que você vai usar
const dbName = 'PI_2_db';

let db = null;

async function connectToDatabase() {
  if (db) {
    return db; // Retorna a conexão já aberta, se existir
  }

  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Conectado ao MongoDB!');
    db = client.db(dbName);
    return db;
  } catch (err) {
    console.error('Erro ao conectar no MongoDB:', err);
    throw err;
  }
}

module.exports = { connectToDatabase };
