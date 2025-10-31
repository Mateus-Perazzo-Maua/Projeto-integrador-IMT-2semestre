require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./database/connection");
const { User } = require("./database/userModel");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Conecta ao banco
connectDB();

// ROTAS DE AUTENTICAÇÃO:

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

// GERAÇÃO DAS IMAGENS:

// configuração do hugging face
const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;

// endpoint para gerar imagens com o hugging face
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, negativePrompt, style } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt é obrigatório'
      });
    }

    if (!HF_API_KEY) {
      return res.status(500).json({
        error: 'API Key não configurada no .env'
      });
    }

    console.log('🎨 Gerando imagem com prompt:', prompt);
    if (style) console.log('🎭 Estilo aplicado:', style);

    // constroi prompt completo
    let fullPrompt = prompt;
    if (style && style !== 'Selecione o estilo') {
      fullPrompt = `${prompt}, ${style} style`;
    }

    console.log('📤 Enviando requisição para Hugging Face...');

    const response = await axios({
      method: 'POST',
      url: 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        inputs: fullPrompt,
        parameters: {
          negative_prompt: negativePrompt || 'low quality, blurry, text, watermark',
          num_inference_steps: 25,
          guidance_scale: 7.5
        }
      },
      responseType: 'arraybuffer',
      timeout: 60000
    });

    console.log('📥 Resposta recebida da Hugging Face');

    // converter imagem para base64
    const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');
    const imageUrl = `data:image/png;base64,${imageBase64}`;

    console.log('✅ Imagem convertida e pronta!');

    res.json({
      success: true,
      imageUrl: imageUrl,
      prompt: fullPrompt
    });

  } catch (error) {
    console.error('❌ Erro ao gerar imagem:', error.response?.status, error.message);

    if (error.response?.status === 503) {
      // modelo carregando
      res.status(503).json({
        error: 'O modelo está carregando. Aguarde 30 segundos e tente novamente.',
        retry: true
      });
    } else if (error.response?.status === 401) {
      res.status(401).json({
        error: 'Token inválido. Verifique sua chave no .env',
        retry: false
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(408).json({
        error: 'Tempo esgotado. Tente um prompt mais simples.',
        retry: true
      });
    } else {
      res.status(500).json({
        error: 'Erro ao gerar imagem. Tente novamente.',
        details: error.message
      });
    }
  }
});

// Endpoint de status (verificar se o servidor está rodando)
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    apiConfigured: true,
    message: 'Servidor funcionando corretamente. Usando Pollinations.ai para geração de imagens.'
  });
});

// ========== INICIAR SERVIDOR ==========

app.listen(PORT, () => {
  console.log(`👿 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🎨 API de geração de imagens: Pollinations.ai (gratuita)`);
  console.log(`✅ Tudo pronto para gerar imagens!`);
});