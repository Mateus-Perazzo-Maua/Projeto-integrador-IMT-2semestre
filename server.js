// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./database/connection');
const userModel = require("./database/userModel");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Conecta ao banco
connectDB();

// ✅ Rota de registro
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Preencha todos os campos!" });
  }

  try {
    const userExists = await userModel.User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: "Usuário ou e-mail já cadastrado!" });
    }

    const newUser = new userModel.User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (err) {
    console.error("Erro ao registrar:", err);
    res.status(500).json({ message: "Erro ao registrar usuário" });
  }
});

// rota de login
const { User } = require("./database/userModel");

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // verifica se veio tudo
    if (!email || !password) {
      return res.status(400).json({ message: "Preencha todos os campos!" });
    }

    // busca usuário pelo e-mail
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "E-mail ou senha incorretos" });
    }

    res.status(200).json({ message: "Login realizado com sucesso!" });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});




app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Preencha todos os campos!" });
  }

  try {
    const userExists = await userModel.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: "Usuário ou e-mail já cadastrado!" });
    }

    const newUser = new userModel({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (err) {
    res.status(500).json({ message: "Erro ao salvar usuário", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
