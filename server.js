require("dotenv").config(); // 🔹 carrega as variáveis do .env logo no início
const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./database/connection");
const { User } = require("./database/userModel");

const app = express();
const PORT = process.env.PORT || 3000; // 🔹 usa a porta do .env se existir

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Conecta ao banco 🔹 agora usando o MONGO_URI do .env
connectDB();

// Rota de registro
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Preencha todos os campos!" });
  }

  try {
    const userExists = await User.findOne({ $or: [{ username }, { email }] });

    if (userExists) {
      return res.status(400).json({ message: "Usuário ou e-mail já cadastrado!" });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (err) {
    console.error("Erro ao registrar:", err);
    res.status(500).json({ message: "Erro ao registrar usuário", error: err.message });
  }
});

// Rota de login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Preencha todos os campos!" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "E-mail não encontrado" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    res.status(200).json({ message: "Login realizado com sucesso!" });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`👿 Servidor rodando em http://localhost:${PORT}`);
});