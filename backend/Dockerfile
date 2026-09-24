FROM node:22-alpine

WORKDIR /app
COPY backend/package*.json ./
RUN npm install

COPY backend/src ./src
COPY mocks /mocks

EXPOSE 3000
CMD ["npm", "start"]
