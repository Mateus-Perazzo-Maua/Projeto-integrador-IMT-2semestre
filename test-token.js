require('dotenv').config();
const axios = require('axios');

const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;

console.log('🔑 Testando token:', HF_API_KEY ? 'Token encontrado' : 'Token NÃO encontrado');
console.log('📝 Primeiros 10 caracteres:', HF_API_KEY?.slice(0, 10));

async function testToken() {
  try {
    const response = await axios.get('https://huggingface.co/api/whoami-v2', {
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`
      }
    });
    
    console.log('✅ Token válido!');
    console.log('👤 Usuário:', response.data);
  } catch (error) {
    console.log('❌ Token inválido!');
    console.log('Erro:', error.response?.data || error.message);
  }
}

testToken();