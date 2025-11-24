const axios = require("axios");
const { User } = require("../../database/userModel");

const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;

// modelos
const HF_MODELS = [
  'black-forest-labs/FLUX.1-dev'
];

async function tryHuggingFace(prompt, modelUrl) {
  console.log(`Tentando modelo: ${modelUrl.split('/').pop()}...`);

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
    timeout: 90000,
    validateStatus: (status) => status < 500
  });

  return response;
}

exports.generateImage = async (req, res) => {
  try {
    const { prompt, negativePrompt, style } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt é obrigatório'
      });
    }

    console.log('Gerando imagem com prompt:', prompt);
    if (style) console.log('Estilo aplicado:', style);

    // construir o prompt
    let fullPrompt = prompt;
    if (style && style !== 'Selecione o estilo') {
      fullPrompt = `${prompt}, ${style} art style, high quality, detailed, 4k`;
    } else {
      fullPrompt = `${prompt}, high quality, detailed, professional, 4k`;
    }

    // tentativa 1 (hugging face)
    if (HF_API_KEY) {
      console.log('Tentando Hugging Face API...');

      for (const model of HF_MODELS) {
        try {
          const hfResponse = await tryHuggingFace(fullPrompt, model);

          // verificar se a resposta é válida
          if (hfResponse.status === 200 && hfResponse.data && hfResponse.data.byteLength > 5000) {
            const imageBase64 = Buffer.from(hfResponse.data, 'binary').toString('base64');
            const imageUrl = `data:image/png;base64,${imageBase64}`;

            console.log(`SUCESSO com ${model.split('/').pop()}!`);

            // salvar histórico no usuário logado
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
                console.log(`Histórico salvo com sucesso para ${email}`);
              } catch (saveErr) {
                console.error("Erro ao salvar histórico:", saveErr.message);
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
            console.log(`Modelo ${model.split('/').pop()} carregando... (aguarde 30s e tente novamente)`);
          } else {
            console.log(`${model.split('/').pop()}: Status ${hfResponse.status}`);
          }

        } catch (modelError) {
          const status = modelError.response?.status;
          const modelName = model.split('/').pop();

          if (status === 503) {
            console.log(`${modelName} está carregando...`);
            return res.status(503).json({
              error: `Modelo está inicializando. Aguarde 30 segundos e tente novamente.`,
              retry: true,
              model: modelName
            });
          } else if (status === 401 || status === 403) {
            console.log(`${modelName} requer autenticação especial`);
          } else if (status === 410) {
            console.log(`${modelName} não está mais disponível`);
          } else {
            console.log(`${modelName} falhou:`, modelError.message);
          }

          continue;
        }
      }

      console.log('Nenhum modelo do Hugging Face funcionou, usando Pollinations...');
    } else {
      console.log('Token do Hugging Face não configurado');
    }

    // tentativa 2 (pollinations)
    console.log('Usando Pollinations.ai...');

    const encodedPrompt = encodeURIComponent(fullPrompt);
    const seed = Date.now();
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true&enhance=true`;

    console.log('URL gerada com Pollinations!');

    res.json({
      success: true,
      imageUrl: imageUrl,
      prompt: fullPrompt,
      provider: 'Pollinations'
    });

  } catch (error) {
    console.error('Erro geral:', error.message);
    res.status(500).json({
      error: 'Erro ao gerar imagem.',
      details: error.message
    });
  }
};

// endpoint de status
exports.getStatus = (req, res) => {
  res.json({
    status: 'online',
    apiConfigured: !!HF_API_KEY,
    message: HF_API_KEY
      ? 'Hugging Face API configurada'
      : 'Usando modo placeholder (configure HUGGING_FACE_API_KEY para IA real)'
  });
};