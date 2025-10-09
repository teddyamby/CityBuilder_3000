# Image de base pour le serveur Node.js
FROM node:18-alpine

WORKDIR /app

# Copier les manifestes et installer les dépendances de production
COPY package.json ./
COPY package-lock.json ./
# Exclure les dépendances de dev (Jest, ESLint) pour alléger l'image
RUN npm ci --omit=dev

# Copier le code de l'application
COPY . .

# Définir le port d'écoute
EXPOSE 3000

# Commande de démarrage de l'application
CMD ["npm", "run", "start"]
