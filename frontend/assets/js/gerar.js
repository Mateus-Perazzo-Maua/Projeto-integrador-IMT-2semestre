const gerarBtn = document.getElementById("gerarBtn");
const promptInput = document.getElementById("prompt");
const resultado = document.getElementById("resultado");

// Temas por matéria
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

// gerar imagem
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
        <p class="text-muted"> Gerando imagem com IA...<br>Aguarde alguns segundos...</p>
      </div>
    `;

        try {
            const fullPrompt = `Educational illustration for ${materia}, topic: ${tema}. ${prompt}. High quality, detailed, clear, professional educational material`;

            console.log('Enviando requisição para gerar imagem...');
            console.log('Prompt:', fullPrompt);

            const email = localStorage.getItem("usuario") || sessionStorage.getItem("usuario");

            const response = await fetch(`${API_URL}/api/generate-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    negativePrompt: 'text, words, letters, low quality, blurry, distorted, ugly',
                    style: estilo !== 'Selecione o estilo' ? estilo : null,
                    email
                })
            });

            console.log('Resposta recebida. Status:', response.status);

            const data = await response.json();
            console.log('Dados recebidos:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao gerar imagem');
            }

            const imgUrl = data.imageUrl;
            console.log('URL da imagem:', imgUrl);

            resultado.innerHTML = '';
            resultado.classList.remove('d-none');

            const title = document.createElement('h5');
            title.className = 'fw-semibold mb-3 text-center';
            title.textContent = 'Resultado:';

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

            img.onload = () => console.log('Imagem carregada e exibida!');
            img.onerror = () => {
                console.error('Erro ao carregar imagem');
                imgContainer.innerHTML = `
          <div class="alert alert-warning">
            Erro ao carregar. <a href="${imgUrl}" target="_blank">Clique aqui para ver</a>
          </div>
        `;
            };

            imgContainer.appendChild(img);

            const btnContainer = document.createElement('div');
            btnContainer.className = 'd-flex gap-3 justify-content-center flex-wrap';

            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'btn btn-success';
            downloadBtn.innerHTML = '<i class="bi bi-download me-2"></i>Baixar Imagem';
            downloadBtn.onclick = async () => {
                try {
                    downloadBtn.disabled = true;
                    downloadBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Baixando...';

                    const response = await fetch(imgUrl);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);

                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `gerai-${materia}-${tema}-${Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    window.URL.revokeObjectURL(url);

                    downloadBtn.disabled = false;
                    downloadBtn.innerHTML = '<i class="bi bi-download me-2"></i>Baixar Imagem';
                } catch (error) {
                    console.error('Erro ao baixar:', error);
                    alert('Erro ao baixar a imagem. Tente novamente.');
                    downloadBtn.disabled = false;
                    downloadBtn.innerHTML = '<i class="bi bi-download me-2"></i>Baixar Imagem';
                }
            };

            const novaBtn = document.createElement('button');
            novaBtn.className = 'btn btn-secondary';
            novaBtn.innerHTML = '<i class="bi bi-arrow-clockwise me-2"></i>Gerar Nova';
            novaBtn.onclick = () => window.location.reload();

            btnContainer.appendChild(downloadBtn);
            btnContainer.appendChild(novaBtn);

            resultado.appendChild(title);
            resultado.appendChild(imgContainer);
            resultado.appendChild(btnContainer);

            console.log('Elementos criados e adicionados à página!');

            // Salvar no histórico
            const usuario = localStorage.getItem("usuario") || sessionStorage.getItem("usuario");
            if (usuario) {
                const chaveHistorico = `historico_${usuario}`;
                const historico = JSON.parse(localStorage.getItem(chaveHistorico)) || [];

                historico.unshift({
                    url: imgUrl,
                    prompt: prompt,
                    materia: materia,
                    tema: tema,
                    data: new Date().toISOString()
                });

                if (historico.length > 50) historico.pop();

                localStorage.setItem(chaveHistorico, JSON.stringify(historico));

                fetch(`${API_URL}/api/save-history`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: usuario,
                        imageData: historico[0]
                    })
                }).catch(console.error);
            }

            setTimeout(() => {
                resultado.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 200);

        } catch (error) {
            console.error('Erro ao gerar imagem:', error);

            resultado.innerHTML = `
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          <strong>Erro:</strong> ${error.message}
          <br><small class="mt-2 d-block">Verifique se o servidor está rodando e tente novamente.</small>
        </div>
      `;
        } finally {
            gerarBtn.disabled = false;
            gerarBtn.innerHTML = originalBtnHtml;
        }
    });
}

// verificar status da API ao carregar página de gerar
document.addEventListener("DOMContentLoaded", function () {
    if (gerarBtn) {
        checkAPIStatus();
    }
});