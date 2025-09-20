# Backend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Install dependencies (including devDeps for TypeScript build)
RUN npm ci --legacy-peer-deps || npm install
# Copy source code
COPY . .
# Build TypeScript to JavaScript
RUN npm run build
# Expose API port
EXPOSE 3001
# Run production server
CMD ["npm","start"]
