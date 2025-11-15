// URL da API
const API_URL = 'http://localhost:3000';

// Obter usuário logado
function getUsuarioLogado() {
    return localStorage.getItem("usuario") || sessionStorage.getItem("usuario");
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

// verificar status da API quando carrega a página de gerar
async function checkAPIStatus() {
    try {
        const response = await fetch(`${API_URL}/api/status`);
        const data = await response.json();

        if (data.status === 'online') {
            console.log('Servidor conectado e funcionando');
            console.log('API:', data.message);
        }
    } catch (error) {
        console.error('Erro ao conectar com servidor:', error);

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