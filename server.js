// ========== CONFIGURAÇÃO (SEMPRE NO TOPO!) ==========
require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const axios = require("axios");
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

// ========== VERIFICAR TOKEN ==========
const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;
console.log("🔑 Token carregado:", HF_API_KEY ? "✅ Sim" : "❌ Não");

// ========== ROTAS DE AUTENTICAÇÃO ==========

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

// ========== 🎨 GERAÇÃO DE IMAGENS COM IA ==========

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, negativePrompt, style } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt é obrigatório'
      });
    }

    console.log('🎨 Gerando imagem com prompt:', prompt);
    if (style) console.log('🎭 Estilo aplicado:', style);

    // Construir prompt completo
    let fullPrompt = prompt;
    if (style && style !== 'Selecione o estilo') {
      fullPrompt = `${prompt}, ${style} style`;
    }

    // Lista de modelos VERIFICADOS em outubro/2025
    const models = [
      'stabilityai/stable-diffusion-xl-base-1.0',
      'runwayml/stable-diffusion-v1-5',
      'CompVis/stable-diffusion-v1-4'
    ];

    // TENTATIVA 1: Hugging Face com tratamento especial
    if (HF_API_KEY) {
      for (const model of models) {
        try {
          console.log(`📤 Tentando: ${model}`);

          // Fazer requisição SEM responseType primeiro para ver o que retorna
          const response = await axios({
            method: 'POST',
            url: `https://api-inference.huggingface.co/models/${model}`,
            headers: {
              'Authorization': `Bearer ${HF_API_KEY}`,
              'Content-Type': 'application/json'
            },
            data: {
              inputs: fullPrompt,
              options: {
                use_cache: false,
                wait_for_model: true
              }
            },
            timeout: 120000, // 2 minutos
            validateStatus: () => true // Aceita qualquer status
          });

          console.log(`📥 Status: ${response.status}`);
          console.log(`📥 Content-Type: ${response.headers['content-type']}`);

          // Verificar se é imagem
          if (response.status === 200) {
            // Se retornou buffer/array, é imagem
            if (Buffer.isBuffer(response.data) || response.data instanceof ArrayBuffer) {
              const imageBase64 = Buffer.from(response.data).toString('base64');
              const imageUrl = `data:image/jpeg;base64,${imageBase64}`;

              console.log('✅ Imagem gerada!');
              console.log(`📦 Tamanho: ${Math.round(imageBase64.length / 1024)} KB`);

              return res.json({
                success: true,
                imageUrl: imageUrl,
                prompt: fullPrompt,
                provider: 'HuggingFace',
                model: model
              });
            }

            // Se retornou array de objetos (formato antigo do HF)
            if (Array.isArray(response.data) && response.data[0]?.image) {
              console.log('✅ Formato array detectado');

              // Converter base64 para data URL
              const imageUrl = `data:image/jpeg;base64,${response.data[0].image}`;

              return res.json({
                success: true,
                imageUrl: imageUrl,
                prompt: fullPrompt,
                provider: 'HuggingFace',
                model: model
              });
            }
          }

          // Se chegou aqui, logar a resposta para debug
          if (response.status === 503) {
            console.log('⏳ Modelo carregando...');
            try {
              const info = typeof response.data === 'string'
                ? JSON.parse(response.data)
                : response.data;
              console.log(`⏱️ Tempo estimado: ${info.estimated_time || '?'}s`);
            } catch (e) { }
          } else if (response.status === 404) {
            console.log('❌ Modelo não encontrado');
          } else {
            console.log('⚠️ Resposta inesperada:',
              typeof response.data === 'string'
                ? response.data.substring(0, 200)
                : 'Formato desconhecido'
            );
          }

        } catch (error) {
          console.log(`❌ Erro: ${error.message}`);
        }
      }
    }

    // TENTATIVA 2: Pollinations.ai (API gratuita sem token!)
    console.log('🔄 Tentando Pollinations.ai...');

    try {
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1024&height=1024&nologo=true`;

      console.log('📤 URL:', pollinationsUrl);

      const pollinationsResponse = await axios({
        method: 'GET',
        url: pollinationsUrl,
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      if (pollinationsResponse.data && pollinationsResponse.data.byteLength > 1000) {
        const imageBase64 = Buffer.from(pollinationsResponse.data).toString('base64');
        const imageUrl = `data:image/jpeg;base64,${imageBase64}`;

        console.log('✅ Imagem gerada com Pollinations.ai!');
        console.log(`📦 Tamanho: ${Math.round(imageBase64.length / 1024)} KB`);

        return res.json({
          success: true,
          imageUrl: imageUrl,
          prompt: fullPrompt,
          provider: 'Pollinations.ai'
        });
      }
    } catch (pollError) {
      console.log('❌ Pollinations.ai falhou:', pollError.message);
    }

    // TENTATIVA 3: Placeholder
    console.log('🔄 Gerando placeholder...');

    const safePrompt = fullPrompt
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .substring(0, 100);

    const canvas = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <circle cx="512" cy="400" r="100" fill="rgba(255,255,255,0.1)"/>
        <text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" 
              fill="white" font-size="32" font-weight="bold" font-family="Arial">
          🎨 IA Temporariamente Indisponível
        </text>
        <text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" 
              fill="white" font-size="16" font-family="Arial" opacity="0.9">
          Modo demonstração
        </text>
        <text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" 
              fill="white" font-size="14" font-family="Arial" opacity="0.7">
          Prompt: ${safePrompt}
        </text>
        <text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" 
              fill="white" font-size="12" font-family="Arial" opacity="0.6">
          Configure uma API válida para gerar imagens reais
        </text>
      </svg>
    `;

    const imageBase64 = Buffer.from(canvas).toString('base64');
    const imageUrl = `data:image/svg+xml;base64,${imageBase64}`;

    console.log('✅ Placeholder gerado!');

    res.json({
      success: true,
      imageUrl: imageUrl,
      prompt: fullPrompt,
      provider: 'Placeholder',
      message: 'Todas as APIs estão indisponíveis no momento.'
    });

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    res.status(500).json({
      error: 'Erro ao gerar imagem.',
      details: error.message
    });
  }
});

// Endpoint de status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    apiConfigured: !!HF_API_KEY,
    message: HF_API_KEY
      ? 'Hugging Face API configurada'
      : 'Usando modo placeholder (configure HUGGING_FACE_API_KEY para IA real)'
  });
});

// ========== INICIAR SERVIDOR ==========

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🎨 API de geração de imagens: ${HF_API_KEY ? '✅ Hugging Face' : '⚠️ Placeholder'}`);
  console.log(`✅ Tudo pronto para gerar imagens!`);
});