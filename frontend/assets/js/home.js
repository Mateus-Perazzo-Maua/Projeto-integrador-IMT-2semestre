// ESTATÍSTICAS DA HOME
function carregarEstatisticas() {
    const usuario = localStorage.getItem("usuario") || sessionStorage.getItem("usuario");

    if (!usuario) return;

    const chaveHistorico = `historico_${usuario}`;
    const historico = JSON.parse(localStorage.getItem(chaveHistorico)) || [];

    const totalImagens = historico.length;
    const tempoMedio = totalImagens > 0 ? "8-15s" : "0s";

    const temasMapa = {};
    historico.forEach(item => {
        const tema = item.tema || "Desconhecido";
        temasMapa[tema] = (temasMapa[tema] || 0) + 1;
    });

    let temaPopular = "Nenhum";
    let maxCount = 0;

    for (const [tema, count] of Object.entries(temasMapa)) {
        if (count > maxCount) {
            maxCount = count;
            temaPopular = tema;
        }
    }

    atualizarEstatisticasDOM(totalImagens, tempoMedio, temaPopular);
}

function atualizarEstatisticasDOM(total, tempo, tema) {
    const statCards = document.querySelectorAll('.stat-card h4');

    if (statCards.length >= 3) {
        statCards[0].textContent = total;
        statCards[1].textContent = tempo;
        statCards[2].textContent = `"${tema}"`;
    }
}

// Carregar estatísticas na home
document.addEventListener("DOMContentLoaded", function () {
    const paginaAtual = window.location.pathname.split("/").pop();

    if (paginaAtual === "home.html") {
        carregarEstatisticas();
    }
});