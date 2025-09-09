// Seletores
const loginContainer = document.getElementById("login-container");
const appContainer = document.getElementById("app-container");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

// Links da sidebar
const homeLink = document.getElementById("home-link");
const gerarLink = document.getElementById("gerar-link");
const historicoLink = document.getElementById("historico-link");

// Seções
const homeSection = document.getElementById("home-section");
const gerarSection = document.getElementById("gerar-section");
const historicoSection = document.getElementById("historico-section");

// Gerador
const gerarBtn = document.getElementById("gerarBtn");
const promptInput = document.getElementById("prompt");
const resultado = document.getElementById("resultado");
const historicoLista = document.getElementById("historico-lista");

// Login
const USER = "admin";
const PASS = "1234";

loginBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === USER && password === PASS) {
    loginContainer.classList.add("hidden");
    appContainer.classList.remove("hidden");
    mostrarSecao("home");
  } else {
    loginError.textContent = "❌ Usuário ou senha incorretos!";
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  appContainer.classList.add("hidden");
  loginContainer.classList.remove("hidden");
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  loginError.textContent = "";
});

// Navegação entre seções
function mostrarSecao(secao) {
  homeSection.classList.add("hidden");
  gerarSection.classList.add("hidden");
  historicoSection.classList.add("hidden");

  if (secao === "home") homeSection.classList.remove("hidden");
  if (secao === "gerar") gerarSection.classList.remove("hidden");
  if (secao === "historico") historicoSection.classList.remove("hidden");

  document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
  if (secao === "home") homeLink.classList.add("active");
  if (secao === "gerar") gerarLink.classList.add("active");
  if (secao === "historico") historicoLink.classList.add("active");
}

homeLink.addEventListener("click", () => mostrarSecao("home"));
gerarLink.addEventListener("click", () => mostrarSecao("gerar"));
historicoLink.addEventListener("click", () => mostrarSecao("historico"));

// Gerar Imagem
async function gerarImagem() {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    resultado.innerHTML = `<p class="text-danger">⚠️ Digite uma descrição primeiro!</p>`;
    return;
  }

  resultado.innerHTML = `<p>⏳ Gerando imagem para: "${prompt}"...</p>`;

  setTimeout(() => {
    const imgUrl = `https://picsum.photos/500/300?random=${Math.random()}`;
    resultado.innerHTML = `<img src="${imgUrl}" alt="Imagem gerada" class="img-fluid rounded shadow"/>`;

    // Adiciona no histórico
    const col = document.createElement("div");
    col.className = "col-md-4 mb-3";
    col.innerHTML = `<img src="${imgUrl}" class="img-fluid rounded shadow">`;
    historicoLista.prepend(col);
  }, 2000);
}

gerarBtn.addEventListener("click", gerarImagem);
