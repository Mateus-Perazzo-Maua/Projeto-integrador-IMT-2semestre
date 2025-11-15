// elementos
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

// carregar perfil na barra lateral
function carregarPerfilSidebar() {
    const usuario = localStorage.getItem("usuario") || sessionStorage.getItem("usuario");

    if (!usuario) {
        console.log("Usuário não está logado");
        return;
    }

    console.log("Carregando perfil para:", usuario);

    // Buscar dados do usuário no banco
    fetch(`${API_URL}/api/user-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: usuario })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Atualizar nome do usuário
                const usernameElement = document.getElementById("sidebar-username");
                if (usernameElement) {
                    usernameElement.textContent = data.user.username || "Usuário";
                }

                // Atualizar email
                const emailElement = document.getElementById("sidebar-email");
                if (emailElement) {
                    emailElement.textContent = usuario;
                }

                console.log("Perfil carregado:", data.user.username);
            } else {
                console.log("Erro ao carregar perfil:", data.message);
                // Mostrar apenas email como fallback
                const emailElement = document.getElementById("sidebar-email");
                if (emailElement) {
                    emailElement.textContent = usuario;
                }
            }
        })
        .catch(err => {
            console.error("Erro ao buscar perfil:", err);

            // fallback: mostrar apenas o email
            const emailElement = document.getElementById("sidebar-email");
            if (emailElement) {
                emailElement.textContent = usuario;
            }
        });
}

// login
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
            const resposta = await fetch(`${API_URL}/login`, {
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
                loginError.textContent = " " + data.message;
            }
        } catch (err) {
            loginError.textContent = "Erro ao conectar ao servidor.";
            console.error(err);
        }
    });
}

// cadastro de usuário
const registerBtn = document.getElementById("registerBtn");
if (registerBtn) {
    registerBtn.addEventListener("click", async () => {
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const msg = document.getElementById("registerMsg");
        msg.textContent = "";

        if (!username || !email || !password) {
            msg.textContent = "Preencha todos os campos!";
            return;
        }

        try {
            const resposta = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await resposta.json();

            if (resposta.ok) {
                msg.classList.remove("text-danger");
                msg.classList.add("text-success");
                msg.textContent = "Usuário cadastrado com sucesso! Redirecionando para o login...";
                setTimeout(() => (window.location.href = "tela-login.html"), 1500);
            } else {
                msg.textContent = " " + data.message;
            }
        } catch (err) {
            msg.textContent = "Erro ao conectar com o servidor.";
            console.error(err);
        }
    });
}

// verificação do login
const protegido = ["home.html", "tela-gerar.html", "historico.html", "perfil.html"];
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

// Carregar perfil do usuário na sidebar quando o DOM carregar
document.addEventListener("DOMContentLoaded", function () {
    const paginasComPerfil = ["home.html", "tela-gerar.html", "historico.html", "perfil.html"];
    const paginaAtual = window.location.pathname.split("/").pop();

    if (paginasComPerfil.includes(paginaAtual)) {
        carregarPerfilSidebar();
    }
});