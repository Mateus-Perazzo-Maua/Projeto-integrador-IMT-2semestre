// Seletores
const loginContainer = document.getElementById("login-container");
const appContainer = document.getElementById("app-container");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

const gerarBtn = document.getElementById("gerarBtn");
const promptInput = document.getElementById("prompt");
const resultado = document.getElementById("resultado");

// Dados fixos de login (simples, só para teste)
const USER = "admin";
const PASS = "1234";

// Função de Login
loginBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === USER && password === PASS) {
    loginContainer.classList.add("hidden");
    appContainer.classList.remove("hidden");
  } else {
    loginError.textContent = "❌ Usuário ou senha incorretos!";
  }
});

// Função Logout
logoutBtn.addEventListener("click", () => {
  appContainer.classList.add("hidden");
  loginContainer.classList.remove("hidden");
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  loginError.textContent = "";
});

// Função Gerar Imagem (simulação)
async function gerarImagem() {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    resultado.innerHTML = `<p class="text-danger">⚠️ Digite uma descrição primeiro!</p>`;
    return;
  }

  resultado.innerHTML = `<p>⏳ Gerando imagem para: "${prompt}"...</p>`;

  // Simulação de API
  setTimeout(() => {
    resultado.innerHTML = `
      <img src="https://picsum.photos/500/300?random=${Math.random()}" 
           alt="Imagem gerada" class="img-fluid rounded shadow"/>`;
  }, 2000);
}

// Evento de clique no botão
gerarBtn.addEventListener("click", gerarImagem);
