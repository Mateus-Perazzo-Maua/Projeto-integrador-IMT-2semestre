const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const deletePasswordConfirm = document.getElementById('deletePasswordConfirm');
const profileMsg = document.getElementById('profileMsg');

const updateInfoBtn = document.getElementById('updateInfoBtn');
const updatePasswordBtn = document.getElementById('updatePasswordBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Funções auxiliares
function showMessage(message, type = 'success') {
  profileMsg.textContent = message;
  profileMsg.className = `alert alert-${type}`;
  profileMsg.classList.remove('d-none');
  
 setTimeout(() => {
    profileMsg.classList.add('d-none');
  }, 5000);
  
  profileMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearPasswordFields() {
  currentPasswordInput.value = '';
  newPasswordInput.value = '';
  deletePasswordConfirm.value = '';
}

// Carregar informações do usuário
async function carregarInformacoesUsuario() {
  const email = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  
  if (!email) {
    window.location.href = 'tela-login.html';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/user-info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (data.success) {
      usernameInput.value = data.user.username;
      emailInput.value = data.user.email;
    } else {
      showMessage('Erro ao carregar informações: ' + data.message, 'warning');
    }
  } catch (error) {
    showMessage('Erro ao conectar com o servidor', 'danger');
  }
}

// Atualizar informações do usuário
async function atualizarInformacoes() {
  const email = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  const username = usernameInput.value.trim();

  if (!username) {
    showMessage(' O nome de usuário não pode estar vazio!', 'warning');
    return;
  }

  // Desabilitar botão durante o processo
  updateInfoBtn.disabled = true;
  const originalHtml = updateInfoBtn.innerHTML;
  updateInfoBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';

  try {
    const response = await fetch(`${API_URL}/api/update-user`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username })
    });

    const data = await response.json();

    if (data.success) {
      showMessage(' Informações atualizadas com sucesso!', 'success');
      
      // Atualizar nome na sidebar
      const sidebarUsername = document.getElementById('sidebar-username');
      if (sidebarUsername) {
        sidebarUsername.textContent = username;
      }
    } else {
      showMessage(' ' + data.message, 'danger');
    }
  } catch (error) {
    showMessage(' Erro ao conectar com o servidor', 'danger');
  } finally {
    updateInfoBtn.disabled = false;
    updateInfoBtn.innerHTML = originalHtml;
  }
}

// Atualizar senha
async function atualizarSenha() {
  const email = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  const currentPassword = currentPasswordInput.value.trim();
  const newPassword = newPasswordInput.value.trim();

  // Validações
  if (!currentPassword) {
    showMessage(' Digite sua senha atual', 'warning');
    currentPasswordInput.focus();
    return;
  }

  if (!newPassword) {
    showMessage(' Digite a nova senha', 'warning');
    newPasswordInput.focus();
    return;
  }

  if (newPassword.length < 4) {
    showMessage(' A nova senha deve ter pelo menos 4 caracteres', 'warning');
    newPasswordInput.focus();
    return;
  }

  if (currentPassword === newPassword) {
    showMessage(' A nova senha deve ser diferente da atual', 'warning');
    newPasswordInput.focus();
    return;
  }

  // Desabilitar botão durante o processo
  updatePasswordBtn.disabled = true;
  const originalHtml = updatePasswordBtn.innerHTML;
  updatePasswordBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Atualizando...';

  try {
    const response = await fetch(`${API_URL}/api/update-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email, 
        currentPassword, 
        newPassword 
      })
    });

    const data = await response.json();

    if (data.success) {
      showMessage(' Senha atualizada com sucesso!', 'success');
      clearPasswordFields();
    } else {
      showMessage(' ' + data.message, 'danger');
    }
  } catch (error) {
    showMessage(' Erro ao conectar com o servidor', 'danger');
  } finally {
    updatePasswordBtn.disabled = false;
    updatePasswordBtn.innerHTML = originalHtml;
  }
}

// Excluir conta
async function excluirConta() {
  const email = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  const password = deletePasswordConfirm.value.trim();

  if (!password) {
    showMessage(' Digite sua senha para confirmar', 'warning');
    return;
  }

  // Desabilitar botão durante o processo
  confirmDeleteBtn.disabled = true;
  const originalHtml = confirmDeleteBtn.innerHTML;
  confirmDeleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Excluindo...';

  try {
    const response = await fetch(`${API_URL}/api/delete-account`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      // Limpar dados do localStorage/sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Mostrar mensagem e redirecionar
      alert(' Conta excluída com sucesso. Você será redirecionado para a página de login.');
      window.location.href = 'tela-login.html';
    } else {
      showMessage(' ' + data.message, 'danger');
      confirmDeleteBtn.disabled = false;
      confirmDeleteBtn.innerHTML = originalHtml;
    }
  } catch (error) {
    showMessage(' Erro ao conectar com o servidor', 'danger');
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.innerHTML = originalHtml;
  }
}

// Event Listeners
if (updateInfoBtn) {
  updateInfoBtn.addEventListener('click', atualizarInformacoes);
} 


if (updatePasswordBtn) {
  updatePasswordBtn.addEventListener('click', () => {
    atualizarSenha();
  });
} 

if (deleteAccountBtn) {
  deleteAccountBtn.addEventListener('click', () => {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
  });
}

if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener('click', excluirConta);
}

// Permitir envio com Enter nos campos de senha
if (currentPasswordInput) {
  currentPasswordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      newPasswordInput.focus();
    }
  });
}

if (newPasswordInput) {
  newPasswordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      atualizarSenha();
    }
  });
}

if (deletePasswordConfirm) {
  deletePasswordConfirm.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      excluirConta();
    }
  });
}

// Carregar informações quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  carregarInformacoesUsuario();
  
  // Marcar link ativo no menu
  const perfilLink = document.querySelector('a[href="perfil.html"]');
  if (perfilLink) {
    perfilLink.classList.add('active');
  }
});