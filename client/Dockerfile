# Étape 1 : Build (Compiler le client avec Node/Vite)
FROM node:20-alpine AS builder

WORKDIR /app

# Utiliser le cache des dépendances
COPY package.json ./
COPY package-lock.json ./
RUN npm ci

# Copier le code source et lancer le build
COPY . .
RUN npm run build

# --- Étape 2 : Service (Servir le client statique avec Nginx) ---
FROM nginx:alpine

# Supprimer la configuration Nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier le fichier de configuration Nginx personnalisé (pour le proxy WebSocket)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers statiques compilés de l'étape 'builder' vers le répertoire de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
