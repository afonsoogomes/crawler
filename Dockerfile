# Imagem Docker
FROM --platform=linux/amd64 ghcr.io/puppeteer/puppeteer:latest

# Criação do diretório de trabalho
WORKDIR /app

# Copia o package.json e yarn.lock para instalar as dependências
COPY package.json ./
COPY yarn.lock ./

# Instalação das dependências do Node.js
RUN yarn install

# Copia o código-fonte para o diretório de trabalho
COPY . .

# Executa o build do código typescript
RUN yarn build

# Comando para iniciar a aplicação
ENTRYPOINT yarn migrate:run && node /app/build/index.js
