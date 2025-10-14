// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./database/connection');
const { getUserByUsername, addUser } = require('./database/userModel');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Conecta ao banco
connectDB();

// ✅ Rota de registro (cadastro)
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const userExists = await getUserByUsername(username);
    if (userExists) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    await addUser({ username, password });
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (err) {
    console.error('Erro ao registrar:', err);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
});

// ✅ Rota de login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Usuário ou senha incorretos' });
    }

    res.json({ message: 'Login realizado com sucesso!' });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
