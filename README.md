# Desafio Desenvolvedor Sênior TypeScript NPLab
Este é um projeto desenvolvido como parte do desafio para uma vaga de desenvolvedor sênior TypeScript, que consiste em um crawler para acessar uma página específica e salvar informações detalhadas.

## Configuração do Ambiente

### Pré-requisitos
- [Docker e Docker Compose instalados](https://www.docker.com/get-started/)
- Observação: Se você estiver utilizando o MacOs, é necessário habilitar a opção `Rosetta for x86/amd64 emulation` na configuração do docker

### 1. Configuração do Ambiente de Desenvolvimento
- Clone o repositório
  ```bash
  git clone https://github.com/seu-usuario/seu-projeto.git

### 2. Banco de Dados
- Configuração do Banco de Dados
  - O Docker Compose sobe automaticamente um contêiner do PostgreSQL
  - As configurações de conexão estão fixas no arquivo docker-compose.yml, porém pode ser utilizado um arquivo `.env`
  - Caso precise acessar o banco de dados, as configurações são as seguintes: Conexão: Postgres, Host: localhost, Usuário: dev, Senha: dev, Porta: 5432

### 3. Execução do Crawler
- Instruções para Execução
  - Acesse a pasta do projeto e execute o comando
    ```bash
    docker-compose up -d

### 4. Documentação das Bibliotecas/Frameworks
- Bibliotecas Utilizadas
  - [dotenv](https://www.npmjs.com/package/dotenv): Gerenciamento de variáveis de ambiente
  - [locate-chrome](https://www.npmjs.com/package/locate-chrome): Localização do binário do Chrome
  - [moment](https://www.npmjs.com/package/moment): Formatação de datas
  - [node-cron](https://www.npmjs.com/package/node-cron): Agendamento de tarefas periódicas
  - [sequelize](https://www.npmjs.com/package/sequelize)`: ORM, para manipulação do banco de dados PostgreSQL, podendo criar migrations, seeders e models
  - [pg](https://www.npmjs.com/package/pg): Driver do postgres para o nodejs (Dependência do ORM sequelize)
  - [pg-hstore](https://www.npmjs.com/package/pg-hstore)`: Serializando e desserialização do JSON para o formato hstore (Dependência do ORM sequelize)
  - [puppeteer](https://www.npmjs.com/package/puppeteer): Automação do navegador para web scraping

### 5. Preparação do Ambiente Linux
Toda a preparação para o ambiente linux já foi feita no Dockerfile, qualquer sistema operacional que executar o docker-compose, subirá um container linux.

### 6. Deploy do Crawler no Linux
Todo o processo de deploy também já está configurado no Dockerfile e docker-compose.yml, basta executar o docker-compose up -d.
Também é possível realizar o deploy em clouds utilizando o Dockerfile, alguns exemplos são: AWS, utilizando o produto Lambda ou na Google Cloud, utilizando o produto Clound Run.

### 7. Manutenção e Monitoramento Contínuo
- Monitoramento Contínuo
  - O monitoramento pode ser feito pelos logs do container e também podendo ser integrado com plataformas de monitoramente para emissão de alertas e notificações, como por exemplo: sentry, datadog, new relic.
- Estratégias para Manutenção
  - A estratégia para manuntenção pode ser feita em conjunto com o monitoramente, ao ser emitido um alerta de erro, os desenvolvedores irão investigar a causa raiz e corrigir
  - O erro pode ser uma mudança na estrutura do HTML da página ou tipos de valores não esperados que dão erro ao inserir no banco de dados.

### 8. Uso de Ferramentas de Automatização e Contêineres
- Dockerfile e docker-compose.yml
  - Ao executar o container docker, o script já estará em execução, já com a cron job configurada no container, executando o script automaticamente a cada 30 minutos

### 9. Notas Adicionais
- Também é possível executar o script no ambiente de desenvolvimento, para isso é necessário criar um arquivo .env na raiz do projeto e definir as seguintes variáveis para informar o banco de dados: `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST` e `DB_PORT`.
- Agora basta executar o comando `yarn dev` ou `npn run dev`
- Ao executar o script no ambiente de desenvolvimento, o navegador será aberto, exibindo todo o processo de web scraping
