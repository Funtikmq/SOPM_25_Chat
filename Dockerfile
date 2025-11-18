FROM node:18-alpine

WORKDIR /app

# Copiază package.json-urile
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Instalează dependencies pentru root, client și server
RUN npm install
RUN cd client && npm install
RUN cd ../server && npm install

# Copiază tot codul sursă
COPY . .

# Build client-ul React cu Vite
RUN cd client && npm run build

# Expune portul
EXPOSE 3001

# Variabile de mediu
ENV NODE_ENV=production
ENV PORT=3001

# Pornește server-ul
CMD ["node", "server/server.js"]