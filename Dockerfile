FROM node:20.17
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
EXPOSE 3003
CMD ["node", "backend/server.js"]