O GerAIpoliedro é uma aplicação web desenvolvida para o Colégio Poliedro, projetada para fornecer uma ferramenta de geração de imagens por Inteligência Artificial, 
otimizando a criação de recursos visuais para professores.

A arquitetura do projeto é baseada nas tecnologias essenciais do front-end: HTML5 é utilizado para a estruturação da interface (como a área de prompt e exibição de resultados), 
enquanto o CSS3 é responsável por toda a camada de apresentação, estilização e design responsivo.

Abase funcional da ferramenta foi feita no JavaScript (JS). 
Ele gerencia toda a lógica de interatividade, capturando o prompt de texto do usuário e fazendo a comunicação com os serviços de IA.

Para garantir a alta disponibilidade da ferramenta e diminuir a chance de bugs ou erros, o sistema implementa uma lógica de fallback: a API Black Forest é usada como fonte primária para a geração de imagens. 
Caso esta API apresente falha ou indisponibilidade, 
o código automaticamente aciona uma requisição de contingência para a API Pollinations, assegurando que o usuário receba o resultado e mantendo a funcionalidade da aplicação.