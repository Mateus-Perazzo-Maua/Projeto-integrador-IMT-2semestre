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

///// AUTENTICAÇÃO \\\\\

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


// Salvar histórico individual
app.post("/api/save-history", async (req, res) => {
  try {
    const { email, imageData } = req.body;
    if (!email || !imageData) {
      return res.status(400).json({ error: "E-mail e dados da imagem são obrigatórios" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    await User.updateOne(
      { email },
      { $push: { history: imageData } }
    );

    res.json({ success: true, message: "Histórico salvo com sucesso" });
  } catch (err) {
    console.error("Erro ao salvar histórico:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GERAÇÃO

const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;

// modelos
const HF_MODELS = [
  'black-forest-labs/FLUX.1-dev'
];

async function tryHuggingFace(prompt, modelUrl) {
  console.log(` Tentando modelo: ${modelUrl.split('/').pop()}...`);

  const response = await axios({
    method: 'POST',
    url: `https://api-inference.huggingface.co/models/${modelUrl}`,
    headers: {
      'Authorization': `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json'
    },
    data: {
      inputs: prompt,
      parameters: {
        num_inference_steps: 20,
        guidance_scale: 7.5
      },
      options: {
        wait_for_model: true,
        use_cache: false
      }
    },
    responseType: 'arraybuffer',
    timeout: 90000, // 90 segundos
    validateStatus: (status) => status < 500 // Aceitar qualquer status não-server-error
  });

  return response;
}

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, negativePrompt, style } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt é obrigatório'
      });
    }

    console.log(' Gerando imagem com prompt:', prompt);
    if (style) console.log(' Estilo aplicado:', style);

    // construir o prompt
    let fullPrompt = prompt;
    if (style && style !== 'Selecione o estilo') {
      fullPrompt = `${prompt}, ${style} art style, high quality, detailed, 4k`;
    } else {
      fullPrompt = `${prompt}, high quality, detailed, professional, 4k`;
    }

    // tentativa 1 (hugging face)
    if (HF_API_KEY) {
      console.log(' Tentando Hugging Face API...');

      for (const model of HF_MODELS) {
        try {
          const hfResponse = await tryHuggingFace(fullPrompt, model);

          // verificar se a resposta é válida
          if (hfResponse.status === 200 && hfResponse.data && hfResponse.data.byteLength > 5000) {
            const imageBase64 = Buffer.from(hfResponse.data, 'binary').toString('base64');
            const imageUrl = `data:image/png;base64,${imageBase64}`;

            console.log(` SUCESSO com ${model.split('/').pop()}!`);

            // Salvar histórico no usuário logado
            const { email } = req.body;
            if (email) {
              try {
                await User.updateOne(
                  { email },
                  {
                    $push: {
                      history: {
                        imageUrl,
                        prompt: fullPrompt,
                        date: new Date()
                      }
                    }
                  }
                );
                console.log(` Histórico salvo com sucesso para ${email}`);
              } catch (saveErr) {
                console.error(" Erro ao salvar histórico:", saveErr.message);
              }
            }

            return res.json({
              success: true,
              imageUrl,
              prompt: fullPrompt,
              provider: 'HuggingFace',
              model: model
            });

          } else if (hfResponse.status === 503) {
            console.log(` Modelo ${model.split('/').pop()} carregando... (aguarde 30s e tente novamente)`);
          } else {
            console.log(` ${model.split('/').pop()}: Status ${hfResponse.status}`);
          }

        } catch (modelError) {
          const status = modelError.response?.status;
          const modelName = model.split('/').pop();

          if (status === 503) {
            console.log(` ${modelName} está carregando...`);
            // Retornar erro 503 pro usuário aguardar
            return res.status(503).json({
              error: `Modelo está inicializando. Aguarde 30 segundos e tente novamente.`,
              retry: true,
              model: modelName
            });
          } else if (status === 401 || status === 403) {
            console.log(` ${modelName} requer autenticação especial`);
          } else if (status === 410) {
            console.log(` ${modelName} não está mais disponível`);
          } else {
            console.log(` ${modelName} falhou:`, modelError.message);
          }

          continue; // Próximo modelo
        }
      }

      console.log(' Nenhum modelo do Hugging Face funcionou, usando Pollinations...');
    } else {
      console.log(' Token do Hugging Face não configurado (configure para melhor qualidade)');
    }

    // tentativa 2 (pollinations)
    console.log(' Usando Pollinations.ai...');

    const encodedPrompt = encodeURIComponent(fullPrompt);
    const seed = Date.now();
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true&enhance=true`;

    console.log(' URL gerada com Pollinations!');

    res.json({
      success: true,
      imageUrl: imageUrl,
      prompt: fullPrompt,
      provider: 'Pollinations'
    });

  } catch (error) {
    console.error(' Erro geral:', error.message);
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

// Rota para retornar o histórico de imagens do usuário
app.post("/api/history", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "E-mail é obrigatório" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    res.json({ success: true, history: user.history });
  } catch (err) {
    console.error("Erro ao buscar histórico:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ====== ESTATÍSTICAS ======
app.post("/api/stats", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "E-mail é obrigatório." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "Usuário não encontrado." });

    const history = user.history || [];

    // Total de imagens
    const totalImages = history.length;

    // Tempo médio simulado (exemplo)
    const avgTime = totalImages > 0 ? (Math.random() * 10 + 5).toFixed(1) : 0;

    // Palavra mais comum dos prompts
    let wordCount = {};
    history.forEach(entry => {
      if (entry.prompt) {
        const words = entry.prompt.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 3) {
            wordCount[word] = (wordCount[word] || 0) + 1;
          }
        });
      }
    });
    const popularWord = Object.keys(wordCount).length > 0
      ? Object.entries(wordCount).sort((a, b) => b[1] - a[1])[0][0]
      : "Nenhum";

    res.json({
      success: true,
      totalImages,
      avgTime,
      popularWord
    });
  } catch (err) {
    console.error("Erro ao gerar estatísticas:", err);
    res.status(500).json({ success: false, message: "Erro interno no servidor." });
  }
});


// INICIAR SERVIDOR:

app.listen(PORT, () => {
  console.log(`👿 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🎨 API de geração de imagens: ${HF_API_KEY ? 'Hugging Face' : 'Placeholder'}`);
  console.log(` Tudo pronto para gerar imagens!`);
});