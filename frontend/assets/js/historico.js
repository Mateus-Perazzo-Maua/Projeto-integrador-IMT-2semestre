const historicoLista = document.getElementById("historico-lista");

// histórico
if (historicoLista) {
    const usuario = localStorage.getItem("usuario") || sessionStorage.getItem("usuario");
    const chaveHistorico = `historico_${usuario}`;
    const historico = JSON.parse(localStorage.getItem(chaveHistorico)) || [];

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
        <p class="mb-1"><strong>Matéria:</strong> ${materia}</p>
        <p class="mb-1"><strong>Tema:</strong> ${tema}</p>
        <p class="mb-2 small text-muted"> ${new Date(data).toLocaleString()}</p>
        <p class="small"><strong>Descrição:</strong> ${prompt}</p>
      `;

            cardBody.innerHTML = infoHtml;

            const cardFooter = document.createElement("div");
            cardFooter.className = "card-footer bg-transparent border-0 text-center";
            cardFooter.innerHTML = `
        <a href="${url}" target="_blank" class="btn btn-outline-primary btn-sm">
          <i class="bi bi-eye me-1"></i> Ver
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