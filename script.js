// elementos
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");
const gerarBtn = document.getElementById("gerarBtn");
const promptInput = document.getElementById("prompt");
const resultado = document.getElementById("resultado");
const historicoLista = document.getElementById("historico-lista");

// LOGIN
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    loginError.textContent = "";

    if (!email || !password) {
      loginError.textContent = "⚠️ Preencha todos os campos!";
      return;
    }

    try {
      const resposta = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await resposta.json();

      if (resposta.ok) {
        const rememberMe = document.getElementById("rememberMe").checked;
      
        if (rememberMe) {
          // Guarda login no localStorage (permanece após fechar o navegador)
          localStorage.setItem("logado", "true");
          localStorage.setItem("usuario", email);
        } else {
          // Guarda login apenas na sessão (some ao fechar o navegador)
          sessionStorage.setItem("logado", "true");
          sessionStorage.setItem("usuario", email);
        }
      
        window.location.href = "home.html";
      } else {
        loginError.textContent = "❌ " + data.message;
      }
    } catch (err) {
      loginError.textContent = "⚠️ Erro ao conectar ao servidor.";
      console.error(err);
    }
  });
}

// CADASTRO DE USUÁRIO
const registerBtn = document.getElementById("registerBtn");
if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("registerMsg");
    msg.textContent = "";

    if (!username || !email || !password) {
      msg.textContent = "⚠️ Preencha todos os campos!";
      return;
    }

    try {
      const resposta = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await resposta.json();

      if (resposta.ok) {
        msg.classList.remove("text-danger");
        msg.classList.add("text-success");
        msg.textContent = "Usuário cadastrado com sucesso! redirecionando para o login";
        // redireciona para o login após 1,5s
        setTimeout(() => (window.location.href = "tela-login.html"), 1500);
      } else {
        msg.textContent = "⚠️ " + data.message;
      }
    } catch (err) {
      msg.textContent = "Erro ao conectar com o servidor.";
      console.error(err);
    }
  });
}

// verifica o login
const protegido = ["home.html", "tela-gerar.html", "historico.html"];
const paginaAtual = window.location.pathname.split("/").pop();

if (protegido.includes(paginaAtual)) {
  const logado = sessionStorage.getItem("logado") || localStorage.getItem("logado");
  if (!logado) {
    window.location.href = "tela-login.html";
  }
}

// logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("logado");
    sessionStorage.removeItem("usuario");
    localStorage.removeItem("logado");
    localStorage.removeItem("usuario");
    window.location.href = "tela-login.html";
  });
}

// gerar imagem
if (gerarBtn) {
  gerarBtn.addEventListener("click", () => {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      resultado.innerHTML = `<p class="text-danger">⚠️ Digite uma descrição primeiro!</p>`;
      return;
    }

    resultado.innerHTML = `<p>⏳ Gerando imagem para: "${prompt}"...</p>`;

    setTimeout(() => {
      const imgUrl = `https://picsum.photos/500/300?random=${Math.random()}`;
      resultado.innerHTML = `<img src="${imgUrl}" alt="Imagem gerada" class="img-fluid rounded shadow"/>`;

      // salva no histórico
      const historico = JSON.parse(localStorage.getItem("historico")) || [];
      historico.unshift(imgUrl);
      localStorage.setItem("historico", JSON.stringify(historico));
    }, 2000);
  });
}

// histórico
if (historicoLista) {
  const historico = JSON.parse(localStorage.getItem("historico")) || [];

  if (historico.length === 0) {
    historicoLista.innerHTML = `<p class="text-muted">Nenhuma imagem gerada ainda.</p>`;
  } else {
    historico.forEach(img => {
      const col = document.createElement("div");
      col.className = "col-md-4 mb-3";
      col.innerHTML = `<img src="${img}" class="img-fluid rounded shadow">`;
      historicoLista.appendChild(col);
    });
  }
}

// Toggle da sidebar em telas pequenas
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.querySelector(".sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });
  }
});