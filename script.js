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
    const materiaSelect = document.getElementById("materia");
    const temaSelect = document.getElementById("tema");
    const estiloSelect = document.getElementById("estilo");
    const promptField = document.getElementById("prompt");
    const imgResultado = document.getElementById("imgResultado");

    if (!materiaSelect || !temaSelect || !promptField) return;

    const materia = materiaSelect.value;
    const tema = temaSelect.value;
    const estilo = estiloSelect ? estiloSelect.value : "";
    const prompt = promptField.value.trim();

    if (!materia || materia === "Selecione a matéria") {
      alert("Por favor, selecione a matéria.");
      return;
    }
    if (!tema || tema === "Selecione o tema") {
      alert("Por favor, selecione o tema.");
      return;
    }
    if (!prompt) {
      alert("Por favor, descreva a imagem desejada.");
      return;
    }

    resultado.classList.remove("d-none");
    resultado.innerHTML = `<p>⏳ Gerando imagem para: "${prompt}"...</p>`;

    setTimeout(() => {
      const seed = `${materia}-${tema}-${estilo}-${prompt}`;
      const imgUrl = `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/400`;

      resultado.innerHTML = `
        <h5 class="fw-semibold mb-3">Resultado:</h5>
        <img id="imgResultado" src="${imgUrl}" class="rounded-4 shadow-lg" alt="gerado" />
      `;

      // salva no histórico
      const historico = JSON.parse(localStorage.getItem("historico")) || [];
      historico.unshift(imgUrl);
      localStorage.setItem("historico", JSON.stringify(historico));
    }, 2000);
  });
}

// Temas automáticos por matéria

const temas = {
  fisica: ["Leis de Newton", "Eletromagnetismo", "Óptica", "Movimento Retilíneo"],
  quimica: ["Tabela Periódica", "Ligações Químicas", "Reações Orgânicas", "Atomística"],
};

const materiaSelect = document.getElementById("materia");
const temaSelect = document.getElementById("tema");

if (materiaSelect && temaSelect) {
  materiaSelect.addEventListener("change", () => {
    const materia = materiaSelect.value;
    temaSelect.innerHTML = '<option selected disabled>Selecione o tema</option>';

    if (temas[materia]) {
      temas[materia].forEach(t => {
        const option = document.createElement("option");
        option.textContent = t;
        option.value = t;
        temaSelect.appendChild(option);
      });
    }
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
      document.body.classList.toggle("sidebar-open");
    });
  }
});