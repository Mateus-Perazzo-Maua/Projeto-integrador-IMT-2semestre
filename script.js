// elementos
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");
const gerarBtn = document.getElementById("gerarBtn");
const promptInput = document.getElementById("prompt");
const resultado = document.getElementById("resultado");
const historicoLista = document.getElementById("historico-lista");

// url da API
const API_URL = 'http://localhost:3000';

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
          localStorage.setItem("logado", "true");
          localStorage.setItem("usuario", email);
        } else {
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

// GERAR IMAGEM
if (gerarBtn) {
  gerarBtn.addEventListener("click", async () => {
    const materiaSelect = document.getElementById("materia");
    const temaSelect = document.getElementById("tema");
    const estiloSelect = document.getElementById("estilo");
    const promptField = document.getElementById("prompt");

    if (!materiaSelect || !temaSelect || !promptField) return;

    const materia = materiaSelect.value;
    const tema = temaSelect.value;
    const estilo = estiloSelect ? estiloSelect.value : "";
    const prompt = promptField.value.trim();

    // validações
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

    // desabilitar botão durante a geração
    gerarBtn.disabled = true;
    const originalBtnHtml = gerarBtn.innerHTML;
    gerarBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Gerando...';

    // mostrar carregando
    resultado.classList.remove("d-none");
    resultado.innerHTML = `
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
        <p class="text-muted">🎨 Gerando imagem com IA...<br>Aguarde alguns segundos...</p>
      </div>
    `;

    try {
      // construir o prompt completo
      const fullPrompt = `Educational illustration for ${materia}, topic: ${tema}. ${prompt}. High quality, detailed, clear, professional educational material`;

      console.log('📤 Enviando requisição para gerar imagem...');
      console.log('📝 Prompt:', fullPrompt);

      // chamar a API
      const response = await fetch(`${API_URL}/api/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          negativePrompt: 'text, words, letters, low quality, blurry, distorted, ugly',
          style: estilo !== 'Selecione o estilo' ? estilo : null
        })
      });

      console.log('📥 Resposta recebida. Status:', response.status);

      const data = await response.json();
      console.log('📦 Dados recebidos:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar imagem');
      }

      // mostrar imagem
      const imgUrl = data.imageUrl;
      console.log('🖼️ URL da imagem:', imgUrl);

      // limpar e mostrar o resultado
      resultado.innerHTML = '';
      resultado.classList.remove('d-none');

      // criar elementos
      const title = document.createElement('h5');
      title.className = 'fw-semibold mb-3 text-center';
      title.textContent = '✅ Resultado:';

      const imgContainer = document.createElement('div');
      imgContainer.className = 'text-center mb-3';

      const img = document.createElement('img');
      img.src = imgUrl;
      img.alt = 'Imagem gerada por IA';
      img.className = 'rounded-4 shadow-lg img-fluid';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.style.margin = '0 auto';

      // eventos da imagem
      img.onload = () => console.log('✅ Imagem carregada e exibida!');
      img.onerror = () => {
        console.error('❌ Erro ao carregar imagem');
        imgContainer.innerHTML = `
          <div class="alert alert-warning">
            Erro ao carregar. <a href="${imgUrl}" target="_blank">Clique aqui para ver</a>
          </div>
        `;
      };

      imgContainer.appendChild(img);

      const btnContainer = document.createElement('div');
      btnContainer.className = 'd-flex gap-3 justify-content-center flex-wrap';
      btnContainer.innerHTML = `
        <a href="${imgUrl}" target="_blank" download="gerai-imagem.png" class="btn btn-success">
          <i class="bi bi-download me-2"></i>Baixar Imagem
        </a>
        <button onclick="window.location.reload()" class="btn btn-secondary">
          <i class="bi bi-arrow-clockwise me-2"></i>Gerar Nova
        </button>
      `;

      // adicionar tudo ao resultado
      resultado.appendChild(title);
      resultado.appendChild(imgContainer);
      resultado.appendChild(btnContainer);

      console.log('✅ Elementos criados e adicionados à página!');

      // salvar no histórico
      const historico = JSON.parse(localStorage.getItem("historico")) || [];
      historico.unshift({
        url: imgUrl,
        prompt: prompt,
        materia: materia,
        tema: tema,
        data: new Date().toISOString()
      });
      if (historico.length > 50) historico.pop();
      localStorage.setItem("historico", JSON.stringify(historico));

      // scroll até o resultado
      setTimeout(() => {
        resultado.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);

    } catch (error) {
      console.error('❌ Erro ao gerar imagem:', error);

      // mostrar erro para o usuário
      resultado.innerHTML = `
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          <strong>Erro:</strong> ${error.message}
          <br><small class="mt-2 d-block">Verifique se o servidor está rodando e tente novamente.</small>
        </div>
      `;
    } finally {
      // reabilitar botão
      gerarBtn.disabled = false;
      gerarBtn.innerHTML = originalBtnHtml;
    }
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

// HISTÓRICO DE IMAGENS
if (historicoLista) {
  const historico = JSON.parse(localStorage.getItem("historico")) || [];

  historicoLista.innerHTML = "";

  if (historico.length === 0) {
    historicoLista.innerHTML = `
      <p class="text-muted">Nenhuma imagem gerada ainda. Vá até a página <a href="tela-gerar.html">Gerar Imagem</a> para criar uma.</p>
    `;
  } else {
    historico.forEach(item => {
      const { url, prompt, materia, tema, data } = item;

      const col = document.createElement("div");
      col.className = "col-md-4";

      const card = document.createElement("div");
      card.className = "card h-100 shadow-sm";

      const img = document.createElement("img");
      img.src = url;
      img.alt = "Imagem gerada por IA";
      img.className = "card-img-top";
      img.style.height = "200px";
      img.style.objectFit = "cover";

      const cardBody = document.createElement("div");
      cardBody.className = "card-body text-start";

      const infoHtml = `
        <p class="mb-1"><strong>📘 Matéria:</strong> ${materia}</p>
        <p class="mb-1"><strong>🧩 Tema:</strong> ${tema}</p>
        <p class="mb-2 small text-muted"><strong>🕒</strong> ${new Date(data).toLocaleString()}</p>
        <p class="small"><strong>🖋️ Descrição:</strong> ${prompt}</p>
      `;

      cardBody.innerHTML = infoHtml;

      const cardFooter = document.createElement("div");
      cardFooter.className = "card-footer bg-transparent border-0 text-center";
      cardFooter.innerHTML = `
        <a href="${url}" target="_blank" class="btn btn-outline-primary btn-sm">
          <i class="bi bi-eye me-1"></i> Ver
        </a>
        <a href="${url}" download="imagem-gerada.png" class="btn btn-success btn-sm ms-2">
          <i class="bi bi-download me-1"></i> Baixar
        </a>
      `;

      card.appendChild(img);
      card.appendChild(cardBody);
      card.appendChild(cardFooter);
      col.appendChild(card);
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

  // verificar status da API quando carrega a página de gerar
  if (gerarBtn) {
    checkAPIStatus();
  }
});

// verificar se a API está funcionando
async function checkAPIStatus() {
  try {
    const response = await fetch(`${API_URL}/api/status`);
    const data = await response.json();

    if (data.status === 'online') {
      console.log('✅ Servidor conectado e funcionando');
      console.log('🎨 API:', data.message);
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com servidor:', error);

    const aviso = document.createElement('div');
    aviso.className = 'alert alert-danger mt-3';
    aviso.innerHTML = `
      <i class="bi bi-x-circle me-2"></i>
      <strong>Erro de conexão:</strong> Não foi possível conectar ao servidor. 
      Verifique se ele está rodando em http://localhost:3000
    `;

    const container = document.querySelector('.welcome-box');
    if (container && gerarBtn) {
      container.insertBefore(aviso, container.firstChild);
      gerarBtn.disabled = true;
    }
  }
}