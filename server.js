const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para JSON
app.use(express.json());

// Servir arquivos estaticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Configuracao MongoDB
const uri = 'mongodb://localhost:27017'; // ou sua URI Atlas
const dbName = 'meuProjeto';
let db;

async function connectToDatabase() {
  if (db) return db;
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();
  console.log('Conectado ao MongoDB');
  db = client.db(dbName);
  return db;
}

// Rota login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Usuário ou senha incorretos' });
    }

    res.json({ message: 'Login realizado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Start do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
