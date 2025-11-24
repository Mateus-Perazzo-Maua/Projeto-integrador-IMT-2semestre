GerAI Poliedro

Geração de imagens educacionais com Inteligência Artificial — desenvolvido para o Colégio Poliedro

O GerAI Poliedro é uma aplicação web criada para auxiliar professores na criação rápida de recursos visuais educativos usando IA.
A ferramenta permite que o usuário selecione uma matéria, um tema e descreva a imagem desejada, gerando automaticamente uma ilustração de alta qualidade, pronta para ser usada em sala de aula.

1. Funcionalidades Principais:
- Geração de imagens por IA usando prompt + tema + matéria
- Histórico salvo localmente e no backend, com data, prompt e preview
- Download direto das imagens geradas
- Controle por usuário (via e-mail salvo no navegador)
- Interface simples e otimizada para uso educacional

2. Tecnologias Utilizadas:
- HTML5
- CSS3
- JavaScript (Frontend)
- Node.js + Express (Backend)
- APIs de IA (Black Forest / Pollinations)

3. Arquitetura da Aplicação:

  3.1. HTML5 – Estrutura
  Responsável pela organização da interface:
    - Área de prompt
    - Seleção de matéria e tema
    - Área de resultado
    - Botões de ação (gerar, baixar, histórico etc.)

  3.2. CSS3 – Estilização e Design Responsivo
  Responsável pelo visual do sistema:
    - Layout e responsividade
    - Tipografia
    - Botões e estados (hover/loading)
    - Cards e contêineres

  3.3. JavaScript – Lógica e Comunicação com APIs
  Toda a inteligência do sistema está em JS:
    - Captura de dados do formulário
    - Envio de requisições para a API de IA
    - Exibição do carregamento
    - Renderização da imagem resultante
    - Salvamento do histórico local + servidor
    - Implementação da lógica de fallback

4. Instalação e Execução:

  4.1. Clonar o repositório
    - git clone https://github.com/Mateus-Perazzo-Maua/Projeto-integrador-IMT-2semestre.git
  
  4.2. Instalar dependências
    - npm install
  
  4.3. Executar o backend
    - npm start

  4.4. Abrir o frontend
    - Abra o arquivo tela-cadastro.html no seu navegador (ou use um servido local como Live Server)

5. Projeto desenvolvido para: Colégio Poliedro

6. Desenvolvido por:
  - Gabriel Yuiti Shigetomi Silva
  - Mateus Perazzo
  - Mateus Perigo Zechetti
  - Pietro Luiz Arrelaro Viscardi







