FROM node:18

# Diretório da aplicação
WORKDIR /usr/src/app

# Copia apenas package.json e package-lock.json primeiro
COPY package*.json ./

# Instala dependências
RUN npm install --legacy-peer-deps


# Copia o restante do código
COPY . .

# Compila o código TypeScript
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
