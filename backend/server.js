require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("../database/connection");

// import das rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const imageRoutes = require('./routes/imageRoutes');
const historyRoutes = require('./routes/historyRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// conecta ao banco
connectDB();

// usar as rotas
app.use(authRoutes);
app.use(userRoutes);
app.use(imageRoutes);
app.use(historyRoutes);

// rota raiz (redireciona pro login)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'pages', 'tela-login.html'));
});

// INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`👿 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🎨 API: ${process.env.HUGGING_FACE_API_KEY ? 'Hugging Face' : 'Pollinations'}`);
  console.log(`🔥 Tudo pronto pra gerar imagens!`);
});