document.addEventListener("DOMContentLoaded", () => {
  const USER = "admin";
  const PASS = "1234";

  // elementos
  const loginBtn = document.getElementById("loginBtn");
  const loginError = document.getElementById("loginError");
  const logoutBtn = document.getElementById("logoutBtn");
  const gerarBtn = document.getElementById("gerarBtn");
  const promptInput = document.getElementById("prompt");
  const resultado = document.getElementById("resultado");
  const historicoLista = document.getElementById("historico-lista");

  // login
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      if (username === USER && password === PASS) {
        // guarda o login na sessão
        sessionStorage.setItem("logado", "true");
        window.location.href = "home.html";
      } else {
        loginError.textContent = "❌ Usuário ou senha incorretos!";
      }
    });
  }

  // verifica o login
  const protegido = ["home.html", "tela-gerar.html", "historico.html"];
  const paginaAtual = window.location.pathname.split("/").pop();

  if (protegido.includes(paginaAtual)) {
    const logado = sessionStorage.getItem("logado");
    if (!logado) {
      window.location.href = "tela-login.html";
    }
  }

  // logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("logado");
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
});
